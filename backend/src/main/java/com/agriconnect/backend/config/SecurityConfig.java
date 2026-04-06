package com.agriconnect.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtFilter jwtFilter;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth

                                                // ✅ PUBLIC ENDPOINTS
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/api/auth/forgot-password/**").permitAll()
                                                .requestMatchers("/api/contact/**").permitAll()
                                                .requestMatchers("/api/admin/login", "/api/admin/setup").permitAll()
                                                .requestMatchers("/api/chat/**", "/public/**").permitAll()
                                                .requestMatchers("/api/crops/all", "/api/crops/available").permitAll()
                                                .requestMatchers("/api/market-prices/**", "/api/schemes/**").permitAll()
                                                .requestMatchers(
                                                                "/api/payments/success",
                                                                "/api/payments/failure",
                                                                "/api/payments/webhook")
                                                .permitAll()

                                                // 🔒 ADMIN
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // 🌾 CROPS
                                                .requestMatchers("/api/crops/my").hasAnyRole("FARMER", "ADMIN")
                                                .requestMatchers("/api/crops", "/api/crops/**")
                                                .hasAnyRole("FARMER", "DEALER", "ADMIN", "CUSTOMER")

                                                // 📋 REQUESTS
                                                .requestMatchers("/api/requests", "/api/requests/**")
                                                .hasAnyRole("FARMER", "DEALER", "ADMIN", "CUSTOMER")
                                                .requestMatchers("/api/crop-requests", "/api/crop-requests/**")
                                                .hasAnyRole("FARMER", "DEALER", "ADMIN", "CUSTOMER")

                                                // 🤝 DEALS
                                                .requestMatchers("/api/deals", "/api/deals/**")
                                                .hasAnyRole("FARMER", "DEALER", "ADMIN", "CUSTOMER")

                                                // 👤 ROLE-BASED
                                                .requestMatchers("/api/farmer", "/api/farmer/**")
                                                .hasAnyRole("FARMER", "ADMIN")
                                                .requestMatchers("/api/dealer", "/api/dealer/**")
                                                .hasAnyRole("DEALER", "ADMIN")

                                                // 🛒 CUSTOMER
                                                .requestMatchers("/api/customer", "/api/customer/**")
                                                .hasAnyRole("CUSTOMER", "ADMIN")

                                                // 🔐 SHARED AUTHENTICATED
                                                .requestMatchers(
                                                                "/api/notifications/**",
                                                                "/api/profile/**",
                                                                "/api/payments/**",
                                                                "/api/dashboard/**")
                                                .authenticated()

                                                .anyRequest().authenticated())
                                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // ✅ हे नवीन — Spring चा default UserDetailsService disable करतो
        // त्यामुळे "Using generated security password" warning येणार नाही
        // आणि 403 fix होईल
        @Bean
        public UserDetailsService userDetailsService() {
                return username -> {
                        throw new UsernameNotFoundException("JWT authentication used — no UserDetailsService needed");
                };
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                // PayU callbacks — credentials नको
                CorsConfiguration payuConfig = new CorsConfiguration();
                payuConfig.setAllowedOriginPatterns(List.of("*"));
                payuConfig.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
                payuConfig.setAllowedHeaders(List.of("*"));
                payuConfig.setAllowCredentials(false);
                source.registerCorsConfiguration("/api/payments/success", payuConfig);
                source.registerCorsConfiguration("/api/payments/failure", payuConfig);
                source.registerCorsConfiguration("/api/payments/webhook", payuConfig);

                // React app — सगळे ports
                CorsConfiguration appConfig = new CorsConfiguration();
                appConfig.setAllowedOrigins(List.of(
                                "http://localhost:5173",
                                "http://localhost:5174",
                                "http://localhost:5175"));
                appConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                appConfig.setAllowedHeaders(List.of("*"));
                appConfig.setAllowCredentials(true);
                source.registerCorsConfiguration("/**", appConfig);

                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}