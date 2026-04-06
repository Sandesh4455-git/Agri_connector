package com.agriconnect.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    // Skip JWT only for truly public endpoints (no token required)
    private static final Set<String> SKIP_EXACT = Set.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/send-otp",
            "/api/auth/check-username",
            "/api/payments/success", // PayU callback — no JWT
            "/api/payments/failure", // PayU callback — no JWT
            "/api/payments/webhook" // PayU callback — no JWT
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Skip exact public paths
        if (SKIP_EXACT.contains(path))
            return true;

        // Skip public prefixes (no auth needed)
        if (path.startsWith("/api/auth/"))
            return true;
        if (path.startsWith("/api/market-prices/"))
            return true;
        if (path.startsWith("/api/schemes/"))
            return true;
        if (path.startsWith("/api/crops/all"))
            return true; // public crop list
        if (path.startsWith("/public/"))
            return true;
        if (path.startsWith("/api/chat/"))
            return true;

        // Everything else requires JWT (including /api/requests/**)
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        System.out.println("🔍 " + request.getMethod() + " " + request.getRequestURI());

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                System.out.println("✅ JWT valid: " + username + " | role: " + role);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        username, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);

            } else {
                System.out.println("❌ JWT invalid or expired");
            }
        } else {
            System.out.println("⚠️ No Authorization header: " + request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }
}