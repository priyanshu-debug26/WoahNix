package com.woahnix_backend.exception;

public class UserNameAlreadyExistExcep extends RuntimeException{

    public UserNameAlreadyExistExcep(String message){
        super(message);
    }
}
