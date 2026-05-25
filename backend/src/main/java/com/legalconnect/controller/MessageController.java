package com.legalconnect.controller;

import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.User;
import com.legalconnect.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/chats")
    public ResponseEntity<List<ChatListItem>> getChatList(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                messageService.getChatList(user.getUserId(), user.getUserType().name())
        );
    }

    @GetMapping("/{caseId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @AuthenticationPrincipal User user,
            @PathVariable int caseId) {
        return ResponseEntity.ok(
                messageService.getMessages(user.getUserId(), user.getUserType().name(), caseId)
        );
    }

   
    @PostMapping(value = "/{caseId}", consumes = "multipart/form-data")
    public ResponseEntity<SuccessResponse> sendMessage(
            @AuthenticationPrincipal User user,
            @PathVariable int caseId,
            @RequestParam(value = "messageText", required = false) String messageText,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        messageService.sendMessage(user.getUserId(), user.getUserType().name(), caseId, messageText, file);
        return ResponseEntity.ok(SuccessResponse.ok("Message sent."));
    }
}
