package com.hotelcontinental.ai_assistant_service.controller;

import com.hotelcontinental.ai_assistant_service.dto.ApiResponse;
import com.hotelcontinental.ai_assistant_service.dto.request.AiChatRequest;
import com.hotelcontinental.ai_assistant_service.dto.response.AiChatResponse;
import com.hotelcontinental.ai_assistant_service.dto.response.AiConversationResponse;
import com.hotelcontinental.ai_assistant_service.dto.response.AiMessageResponse;
import com.hotelcontinental.ai_assistant_service.service.AiAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class AiAssistantController {
    private final AiAssistantService aiAssistantService;

    @GetMapping("/me")
    public ApiResponse<AiConversationResponse> getOrCreateMyConversation() {
        return ApiResponse.<AiConversationResponse>builder()
                .result(aiAssistantService.getOrCreateMyConversation())
                .build();
    }

    @GetMapping("/{id}/messages")
    public ApiResponse<List<AiMessageResponse>> getMessages(@PathVariable String id) {
        return ApiResponse.<List<AiMessageResponse>>builder()
                .result(aiAssistantService.getMyMessages(id))
                .build();
    }

    @PostMapping("/chat")
    public ApiResponse<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        return ApiResponse.<AiChatResponse>builder()
                .result(aiAssistantService.chat(request))
                .build();
    }
}
