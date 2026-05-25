package com.legalconnect.service;

import com.legalconnect.config.FileStorageConfig;
import com.legalconnect.dto.Dto.*;
import com.legalconnect.entity.Case;
import com.legalconnect.entity.CaseMessage;
import com.legalconnect.entity.User;
import com.legalconnect.exception.AppException;
import com.legalconnect.repository.CaseMessageRepository;
import com.legalconnect.repository.CaseRepository;
import com.legalconnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class MessageService {

    private final CaseRepository caseRepository;
    private final CaseMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CaseService caseService;
    private final FileStorageConfig fileStorageConfig;

    public MessageService(CaseRepository caseRepository,
                          CaseMessageRepository messageRepository,
                          UserRepository userRepository,
                          CaseService caseService,
                          FileStorageConfig fileStorageConfig) {
        this.caseRepository = caseRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.caseService = caseService;
        this.fileStorageConfig = fileStorageConfig;
    }


    public List<ChatListItem> getChatList(int userId, String userType) {
        List<Case> cases = "client".equals(userType)
                ? caseRepository.findByClientUserId(userId)
                : caseRepository.findActiveCasesByLawyerUserId(userId);

        return cases.stream()
                .map(c -> {
                    User other = getOtherParty(userType, c);
                    long unread = messageRepository.countUnread(c.getCaseId(), userId);
                    return new ChatListItem(
                            c.getCaseId(),
                            c.getCaseTitle(),
                            c.getCaseStatus().name(),
                            other != null ? other.getFirstName() + " " + other.getLastName() : "Unassigned",
                            unread
                    );
                })
                .toList();
    }


    @Transactional
    public List<MessageResponse> getMessages(int userId, String userType, int caseId) {
        Case aCase = caseRepository.findById(caseId)
                .orElseThrow(() -> AppException.notFound("Case not found"));

        if (!caseService.canAccessCase(userType, userId, aCase)) {
            throw AppException.forbidden("You do not have access to this case");
        }

        messageRepository.markAllReadInCase(caseId, userId);

        return messageRepository.findByCaseIdOrdered(caseId).stream()
                .map(m -> new MessageResponse(
                        m.getMessageId(),
                        m.getSender().getUserId(),
                        m.getSender().getFirstName() + " " + m.getSender().getLastName(),
                        m.getMessageText(),
                        m.getFilePath(),
                        m.isRead(),
                        m.getCreatedAt()
                ))
                .toList();
    }


    @Transactional
    public void sendMessage(int senderUserId, String userType, int caseId,
                            String messageText, MultipartFile file) {

        Case aCase = caseRepository.findById(caseId)
                .orElseThrow(() -> AppException.notFound("Case not found"));

        if (!caseService.canAccessCase(userType, senderUserId, aCase)) {
            throw AppException.forbidden("You do not have access to this case");
        }

        if ((messageText == null || messageText.isBlank()) && (file == null || file.isEmpty())) {
            throw AppException.badRequest("Message text or file is required");
        }

        String filePath = null;
        if (file != null && !file.isEmpty()) {
            filePath = saveFile(file);
        }

        User sender = userRepository.getReferenceById(senderUserId);
        CaseMessage msg = new CaseMessage();
        msg.setACase(aCase);
        msg.setSender(sender);
        msg.setMessageText(messageText != null ? messageText.trim() : null);
        msg.setFilePath(filePath);
        messageRepository.save(msg);
    }


    private User getOtherParty(String userType, Case c) {
        if ("client".equals(userType)) {
            return c.getLawyer() != null ? c.getLawyer().getUser() : null;
        }
        return c.getClient().getUser();
    }

    private String saveFile(MultipartFile file) {
        try {
            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String clean = original.replaceAll("[^a-zA-Z0-9.\\-_]", "_");
            String fileName = System.currentTimeMillis() + "_" + clean;
            Path dest = Paths.get(fileStorageConfig.getChatFilesDir()).resolve(fileName);
            Files.createDirectories(dest.getParent());
            file.transferTo(dest);
            return "chat_files/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save chat file", e);
        }
    }
}
