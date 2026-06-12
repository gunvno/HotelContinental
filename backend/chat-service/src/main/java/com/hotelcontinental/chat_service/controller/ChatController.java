package com.hotelcontinental.chat_service.controller;

import com.hotelcontinental.chat_service.dto.ApiResponse;
import com.hotelcontinental.chat_service.dto.request.SendMessageRequest;
import com.hotelcontinental.chat_service.dto.response.ChatConversationResponse;
import com.hotelcontinental.chat_service.dto.response.ChatMessageResponse;
import com.hotelcontinental.chat_service.service.interfaces.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('CHAT_CUSTOMER_VIEW')")
    public ApiResponse<ChatConversationResponse> getOrCreateMyConversation() {
        return ApiResponse.<ChatConversationResponse>builder()
                .result(chatService.getOrCreateMyConversation())
                .build();
    }

    @PostMapping("/me/messages")
    @PreAuthorize("hasAuthority('CHAT_CUSTOMER_SEND')")
    public ApiResponse<ChatMessageResponse> sendCustomerMessage(@RequestBody SendMessageRequest request) {
        return ApiResponse.<ChatMessageResponse>builder()
                .result(chatService.sendCustomerMessage(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CHAT_STAFF_VIEW')")
    public ApiResponse<List<ChatConversationResponse>> getConversations() {
        return ApiResponse.<List<ChatConversationResponse>>builder()
                .result(chatService.getConversations())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CHAT_CUSTOMER_VIEW', 'CHAT_STAFF_VIEW')")
    public ApiResponse<ChatConversationResponse> getConversation(@PathVariable String id) {
        return ApiResponse.<ChatConversationResponse>builder()
                .result(chatService.getConversation(id))
                .build();
    }

    @GetMapping("/{id}/messages")
    @PreAuthorize("hasAnyAuthority('CHAT_CUSTOMER_VIEW', 'CHAT_STAFF_VIEW')")
    public ApiResponse<List<ChatMessageResponse>> getMessages(
            @PathVariable String id,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime after
    ) {
        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(chatService.getMessages(id, after))
                .build();
    }

    @PostMapping("/{id}/reply")
    @PreAuthorize("hasAuthority('CHAT_STAFF_REPLY')")
    public ApiResponse<ChatMessageResponse> reply(
            @PathVariable String id,
            @RequestBody SendMessageRequest request
    ) {
        return ApiResponse.<ChatMessageResponse>builder()
                .result(chatService.reply(id, request))
                .build();
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('CHAT_CUSTOMER_VIEW', 'CHAT_STAFF_VIEW')")
    public ApiResponse<Void> markAsRead(@PathVariable String id) {
        chatService.markAsRead(id);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAuthority('CHAT_CLOSE')")
    public ApiResponse<ChatConversationResponse> close(@PathVariable String id) {
        return ApiResponse.<ChatConversationResponse>builder()
                .result(chatService.closeConversation(id))
                .build();
    }
}
