package com.hotelcontinental.room_service.service.interfaces;

import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface CloudinaryService {
    Map<String, String> uploadImage(MultipartFile file, String folder);
}