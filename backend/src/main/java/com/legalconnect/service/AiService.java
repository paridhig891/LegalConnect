package com.legalconnect.service;

import com.legalconnect.dto.Dto.AiChatRequest;
import com.legalconnect.dto.Dto.AiChatResponse;
import com.legalconnect.dto.Dto.AiMessageHistory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    @Value("${app.gemini.endpoint}")
    private String endpoint;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String SYSTEM_INSTRUCTION = """
            You are LegalConnect AI, a legal assistant on a legal services marketplace platform.
            Your role is to:
            - Provide general legal information and guidance to clients
            - Help users understand legal concepts, processes, and terminology
            - Assist with understanding their rights and options
            - Guide users on when they may need professional legal representation
            - Answer questions about legal procedures and documentation
            
            Important guidelines:
            - Always clarify that you provide general information, not specific legal advice
            - Recommend consulting with a qualified lawyer for specific legal matters
            - Be empathetic and professional in your responses
            - Prioritize user safety and well-being in sensitive legal situations
            - Do not provide advice on how to engage in illegal activities
            
            You are familiar with various areas of law including civil, criminal, family, property,
            employment, and contract law.
            """;

    public AiChatResponse chat(AiChatRequest req) {
        if (apiKey == null || apiKey.isBlank()) {
            return new AiChatResponse(false, "AI assistant is not configured. Please set GEMINI_API_KEY.");
        }

        try {
            String url = endpoint + "/" + model + ":generateContent?key=" + apiKey;

            List<Map<String, Object>> contents = new ArrayList<>();

            if (req.history() != null) {
                for (AiMessageHistory h : req.history()) {
                    contents.add(Map.of(
                            "role", h.role(),
                            "parts", List.of(Map.of("text", h.text()))
                    ));
                }
            }

            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", req.message()))
            ));

            Map<String, Object> body = Map.of(
                    "system_instruction", Map.of(
                            "parts", List.of(Map.of("text", SYSTEM_INSTRUCTION))
                    ),
                    "contents", contents,
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "maxOutputTokens", 1024
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);

            String reply = extractReplyText(response.getBody());
            return new AiChatResponse(true, reply);

        } catch (Exception e) {
            return new AiChatResponse(false, "AI assistant is temporarily unavailable. Please try again later.");
        }
    }

    @SuppressWarnings("unchecked")
    private String extractReplyText(Map<?, ?> responseBody) {
        if (responseBody == null) return "No response received.";
        try {
            var candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) return "No response from AI.";
            var content = (Map<String, Object>) candidates.get(0).get("content");
            var parts   = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            return "Could not parse AI response.";
        }
    }
}
