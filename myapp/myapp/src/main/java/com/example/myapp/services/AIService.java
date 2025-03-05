package com.example.myapp.services;

import com.example.myapp.dto.AIRequestDTO;
import com.example.myapp.dto.AIResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class AIService {
    private final WebClient webClient;
    private final String apiKey = System.getenv("GEMINI_API_KEY");

    public AIService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
    }

    public String getAIResponse(String prompt) {
        AIRequestDTO request = new AIRequestDTO(prompt);

        AIResponseDTO response = webClient.post()
                .uri("/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AIResponseDTO.class)
                .block();

        return response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()
                ? response.getCandidates().get(0).getContent().getParts().get(0).getText()
                : "No response from AI";
    }
}
