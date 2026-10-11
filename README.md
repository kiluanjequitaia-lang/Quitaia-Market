# Quitaia Market

Marketplace mobile-first para Angola, em português, com preços em Kz e identidade visual verde/dourada.

## Estado

Este repositório contém o starter da Fase 1. Antes de disponibilizar publicamente, configure as variáveis Supabase, aplique a migration SQL e valide os fluxos de autenticação, anúncios e permissões.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase Auth, Postgres, Storage e Row Level Security

## Preparação local

1. Instale Node.js LTS.
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local` e configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Aplique `supabase/migrations/0001_marketplace_phase1.sql` no projecto Supabase dedicado ao Quitaia Market.
5. Execute `npm run dev`.

Não inclua chaves `service_role`, tokens ou segredos no frontend nem no Git.

## Limitações conhecidas da fase inicial

- OTP por telefone depende de configurar Phone Auth e um fornecedor SMS real no Supabase.
- Compilação, testes integrados e publicação devem ser confirmados antes do lançamento.
- Não existem anúncios fictícios de produção; apenas categorias iniciais.
