package com.woahnix_backend.service;

import com.woahnix_backend.exception.EmailAlreadyExist;
import com.woahnix_backend.exception.UserNameAlreadyExistExcep;
import com.woahnix_backend.model.User;
import com.woahnix_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user){

        if(userRepository.existsByUsername(user.getUsername())){
            throw new UserNameAlreadyExistExcep(
                    "Username already taken!"
            );
        }

        if(userRepository.existsByEmail(user.getEmail())){
            throw new EmailAlreadyExist(
                    "Email is already registered!"
            );
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);
    }
}