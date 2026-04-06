package com.agriconnect.backend.service;

import com.agriconnect.backend.model.Payment;
import com.agriconnect.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentExcelService {

    private final PaymentRepository paymentRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] generatePaymentReconciliationExcel() throws Exception {
        List<Payment> all = paymentRepository.findAll();
        List<Payment> stuck = all.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.PENDING)
                .toList();
        List<Payment> completed = all.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .toList();

        XSSFWorkbook wb = new XSSFWorkbook();

        // ── Styles ────────────────────────────────────────────────────────
        CellStyle headerStyle = createHeaderStyle(wb, "1A3A28", true);
        CellStyle redStyle = createDataStyle(wb, "FFC7CE");
        CellStyle greenStyle = createDataStyle(wb, "C6EFCE");
        CellStyle normalStyle = createDataStyle(wb, "FFFFFF");
        CellStyle titleStyle = createTitleStyle(wb);
        CellStyle totalStyle = createHeaderStyle(wb, "C00000", true);
        CellStyle summaryGreen = createHeaderStyle(wb, "2D6A4F", true);

        // ── Sheet 1: Stuck Payments ───────────────────────────────────────
        XSSFSheet ws1 = wb.createSheet("Stuck Payments 🔴");
        buildPaymentsSheet(wb, ws1, stuck, "🌾 AgriConnect — Stuck / Pending Payments",
                headerStyle, redStyle, greenStyle, normalStyle, titleStyle, totalStyle, true);

        // ── Sheet 2: All Payments ─────────────────────────────────────────
        XSSFSheet ws2 = wb.createSheet("All Payments");
        buildPaymentsSheet(wb, ws2, all, "🌾 AgriConnect — All Payments",
                headerStyle, redStyle, greenStyle, normalStyle, titleStyle, totalStyle, false);

        // ── Sheet 3: Summary ──────────────────────────────────────────────
        XSSFSheet ws3 = wb.createSheet("Summary Dashboard");
        buildSummarySheet(wb, ws3, all, stuck, completed,
                titleStyle, headerStyle, summaryGreen, totalStyle);

        // ── Write to bytes ────────────────────────────────────────────────
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        wb.write(out);
        wb.close();
        return out.toByteArray();
    }

    private void buildPaymentsSheet(XSSFWorkbook wb, XSSFSheet ws,
            List<Payment> payments, String title,
            CellStyle headerStyle, CellStyle redStyle, CellStyle greenStyle,
            CellStyle normalStyle, CellStyle titleStyle, CellStyle totalStyle,
            boolean stuckOnly) {

        int r = 0;

        // Title row
        Row titleRow = ws.createRow(r++);
        titleRow.setHeightInPoints(36);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(title);
        titleCell.setCellStyle(titleStyle);
        ws.addMergedRegion(new CellRangeAddress(0, 0, 0, 9));

        // Subtitle
        Row subRow = ws.createRow(r++);
        subRow.setHeightInPoints(20);
        Cell subCell = subRow.createCell(0);
        subCell.setCellValue("Generated: " + java.time.LocalDateTime.now().format(FMT)
                + "   |   Total: " + payments.size() + " records");
        ws.addMergedRegion(new CellRangeAddress(1, 1, 0, 9));

        r++; // spacer

        // Header row
        String[] headers = { "#", "Txn ID", "From (Payer)", "To (Receiver)",
                "Crop", "Qty", "Unit", "Amount (₹)", "Method", "Status", "Date" };
        Row hRow = ws.createRow(r++);
        hRow.setHeightInPoints(28);
        for (int i = 0; i < headers.length; i++) {
            Cell c = hRow.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        // Data rows
        int serial = 1;
        double total = 0;
        for (Payment p : payments) {
            Row row = ws.createRow(r++);
            row.setHeightInPoints(22);

            CellStyle style = p.getStatus() == Payment.PaymentStatus.PENDING ? redStyle
                    : p.getStatus() == Payment.PaymentStatus.COMPLETED ? greenStyle : normalStyle;

            setCell(row, 0, serial++, style);
            setCell(row, 1, p.getPayuTxnId() != null ? p.getPayuTxnId() : "#" + p.getId(), style);
            setCell(row, 2, p.getFromUsername() != null ? p.getFromUsername() : "—", style);
            setCell(row, 3, p.getToUsername() != null ? p.getToUsername() : "—", style);
            setCell(row, 4, p.getCropName() != null ? p.getCropName() : "—", style);
            setCell(row, 5, p.getQuantity() != null ? p.getQuantity() : 0.0, style);
            setCell(row, 6, p.getUnit() != null ? p.getUnit() : "—", style);
            setCell(row, 7, p.getAmount() != null ? p.getAmount() : 0.0, style);
            setCell(row, 8, p.getPaymentMethod() != null ? p.getPaymentMethod().name() : "—", style);
            setCell(row, 9, p.getStatus() != null ? p.getStatus().name() : "—", style);
            setCell(row, 10, p.getCreatedAt() != null ? p.getCreatedAt().format(FMT) : "—", style);

            total += p.getAmount() != null ? p.getAmount() : 0;
        }

        // Total row
        Row totRow = ws.createRow(r);
        totRow.setHeightInPoints(28);
        Cell totLabel = totRow.createCell(0);
        totLabel.setCellValue(stuckOnly ? "TOTAL STUCK AMOUNT" : "GRAND TOTAL");
        totLabel.setCellStyle(totalStyle);
        ws.addMergedRegion(new CellRangeAddress(r, r, 0, 6));
        for (int i = 1; i <= 6; i++) {
            Cell c = totRow.createCell(i);
            c.setCellStyle(totalStyle);
        }
        Cell totAmt = totRow.createCell(7);
        totAmt.setCellValue(total);
        totAmt.setCellStyle(totalStyle);

        Cell totCount = totRow.createCell(8);
        totCount.setCellValue(payments.size() + " payments");
        totCount.setCellStyle(totalStyle);
        ws.addMergedRegion(new CellRangeAddress(r, r, 8, 10));

        // Column widths
        int[] widths = { 5, 24, 18, 18, 14, 8, 8, 14, 16, 12, 18 };
        for (int i = 0; i < widths.length; i++) {
            ws.setColumnWidth(i, widths[i] * 256);
        }
    }

    private void buildSummarySheet(XSSFWorkbook wb, XSSFSheet ws,
            List<Payment> all, List<Payment> stuck, List<Payment> completed,
            CellStyle titleStyle, CellStyle headerStyle,
            CellStyle greenStyle, CellStyle redStyle) {

        Row titleRow = ws.createRow(0);
        titleRow.setHeightInPoints(40);
        Cell tc = titleRow.createCell(0);
        tc.setCellValue("📊 Payment Summary Dashboard");
        tc.setCellStyle(titleStyle);
        ws.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

        double totalAmt = all.stream().mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0).sum();
        double stuckAmt = stuck.stream().mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0).sum();
        double completedAmt = completed.stream().mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0).sum();

        Object[][] summaryData = {
                { "Total Payments", all.size(), headerStyle },
                { "Total Amount (₹)", totalAmt, headerStyle },
                { "✅ Completed Payments", completed.size(), greenStyle },
                { "✅ Completed Amount (₹)", completedAmt, greenStyle },
                { "🔴 Stuck / Pending", stuck.size(), redStyle },
                { "🔴 Stuck Amount (₹)", stuckAmt, redStyle },
        };

        int r = 2;
        for (Object[] item : summaryData) {
            Row row = ws.createRow(r++);
            row.setHeightInPoints(36);

            Cell labelCell = row.createCell(0);
            labelCell.setCellValue((String) item[0]);
            labelCell.setCellStyle((CellStyle) item[2]);
            ws.addMergedRegion(new CellRangeAddress(r - 1, r - 1, 0, 3));

            Cell valCell = row.createCell(4);
            if (item[1] instanceof Double) {
                valCell.setCellValue((Double) item[1]);
            } else {
                valCell.setCellValue((Integer) item[1]);
            }
            valCell.setCellStyle((CellStyle) item[2]);
            ws.addMergedRegion(new CellRangeAddress(r - 1, r - 1, 4, 5));
        }

        // Legend
        ws.createRow(r + 1).createCell(0)
                .setCellValue("🔴 Red = Stuck/Pending Payment — Receiver ला पैसे मिळाले नाहीत");
        ws.createRow(r + 2).createCell(0).setCellValue("🟢 Green = Completed Payment — यशस्वी transaction");
        ws.createRow(r + 3).createCell(0)
                .setCellValue("📌 दर महिन्याला हा report export करा आणि stuck payments resolve करा");

        ws.setColumnWidth(0, 30 * 256);
        ws.setColumnWidth(1, 16 * 256);
        ws.setColumnWidth(2, 16 * 256);
        ws.setColumnWidth(3, 16 * 256);
        ws.setColumnWidth(4, 20 * 256);
        ws.setColumnWidth(5, 16 * 256);
    }

    // ── Style helpers ─────────────────────────────────────────────────────────

    private CellStyle createHeaderStyle(XSSFWorkbook wb, String hexColor, boolean bold) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(hexToBytes(hexColor), null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        XSSFFont font = wb.createFont();
        font.setBold(bold);
        font.setColor(new XSSFColor(new byte[] { (byte) 255, (byte) 255, (byte) 255 }, null));
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorder(style);
        return style;
    }

    private CellStyle createDataStyle(XSSFWorkbook wb, String hexColor) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(hexToBytes(hexColor), null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        XSSFFont font = wb.createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorder(style);
        return style;
    }

    private CellStyle createTitleStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setFontName("Arial");
        font.setColor(new XSSFColor(hexToBytes("1A3A28"), null));
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private void setBorder(XSSFCellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private void setCell(Row row, int col, Object value, CellStyle style) {
        Cell cell = row.createCell(col);
        if (value instanceof String)
            cell.setCellValue((String) value);
        else if (value instanceof Double)
            cell.setCellValue((Double) value);
        else if (value instanceof Integer)
            cell.setCellValue((Integer) value);
        else
            cell.setCellValue(String.valueOf(value));
        cell.setCellStyle(style);
    }

    private byte[] hexToBytes(String hex) {
        int r = Integer.parseInt(hex.substring(0, 2), 16);
        int g = Integer.parseInt(hex.substring(2, 4), 16);
        int b = Integer.parseInt(hex.substring(4, 6), 16);
        return new byte[] { (byte) r, (byte) g, (byte) b };
    }
}