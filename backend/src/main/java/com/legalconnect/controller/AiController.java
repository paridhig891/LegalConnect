package com.legalconnect.controller;

import com.legalconnect.dto.Dto.AiChatRequest;
import com.legalconnect.dto.Dto.AiChatResponse;
import com.legalconnect.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/support")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest req) {
        return ResponseEntity.ok(aiService.chat(req));
    }
}
