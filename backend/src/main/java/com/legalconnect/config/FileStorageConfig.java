package com.legalconnect.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Value("${app.upload.base-dir}")
    private String baseDir;

    @Value("${app.upload.case-documents}")
    private String caseDocumentsDir;

    @Value("${app.upload.chat-files}")
    private String chatFilesDir;

    @PostConstruct
    public void createUploadDirectories() throws IOException {
        Files.createDirectories(Paths.get(caseDocumentsDir));
        Files.createDirectories(Paths.get(chatFilesDir));
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(baseDir).toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }

    public String getCaseDocumentsDir() { return caseDocumentsDir; }
    public String getChatFilesDir()     { return chatFilesDir; }
}
