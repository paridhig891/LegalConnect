package com.legalconnect.repository;

import com.legalconnect.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Integer> {

    Optional<Client> findByUser_UserId(int userId);
}
