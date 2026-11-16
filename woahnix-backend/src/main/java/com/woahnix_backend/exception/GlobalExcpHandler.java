package com.woahnix_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.woahnix_backend.dto.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExcpHandler {

    @ExceptionHandler(EmailAlreadyExist.class)
    public ResponseEntity<ErrorResponse> handleEmailExist(
            EmailAlreadyExist ex){

        ErrorResponse response = new ErrorResponse(
                409,
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    @ExceptionHandler(UserNameAlreadyExistExcep.class)
    public ResponseEntity<ErrorResponse> handleUsernameExist(
            UserNameAlreadyExistExcep ex){
        ErrorResponse response = new ErrorResponse(
                409,
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }
}
