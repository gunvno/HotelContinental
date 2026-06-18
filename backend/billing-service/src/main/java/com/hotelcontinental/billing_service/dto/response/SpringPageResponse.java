package com.hotelcontinental.billing_service.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpringPageResponse<T> {
    List<T> content;
    long totalElements;
    int totalPages;
    int size;
    int number;
}
