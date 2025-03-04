package com.tripzin.techminds.exception;

import org.springframework.http.HttpStatus;

public class TokenRefreshException extends AppException {
    
    public TokenRefreshException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}
