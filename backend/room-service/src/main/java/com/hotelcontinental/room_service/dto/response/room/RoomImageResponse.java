package com.hotelcontinental.room_service.dto.response.room;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomImageResponse {
    String id;
    String url;
    String publicId;
    Boolean isCover;
    Integer sortOrder;
}