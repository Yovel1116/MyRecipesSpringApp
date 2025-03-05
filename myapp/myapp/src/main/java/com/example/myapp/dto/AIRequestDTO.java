package com.example.myapp.dto;

import java.util.List;

public class AIRequestDTO {
    private List<Content> contents;

    public AIRequestDTO(String prompt) {
        this.contents = List.of(new Content("user", List.of(new Part(prompt))));
    }

    public List<Content> getContents() {
        return contents;
    }

    public static class Content {
        private String role;
        private List<Part> parts;

        public Content(String role, List<Part> parts) {
            this.role = role;
            this.parts = parts;
        }

        public String getRole() {
            return role;
        }

        public List<Part> getParts() {
            return parts;
        }
    }

    public static class Part {
        private String text;

        public Part(String text) {
            this.text = text;
        }

        public String getText() {
            return text;
        }
    }
}
