# Quitaia Market

Marketplace mobile-first para Angola, em português de Angola, com preços em Kz e identidade visual verde/dourada.

## Estrutura actual

- `src/App.tsx`: feed, categorias, pesquisa, favoritos de sessão, publicação, OTP, perfil e gestão básica dos próprios anúncios.
- `src/lib/`: cliente Supabase opcional e formatação Kz.
- `supabase/migrations/`: esquema inicial, RLS e armazenamento de imagens.
- `supabase/seed.sql`: categorias iniciais; não cria anúncios fictícios.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Supabase Auth, PostgreSQL, Storage e Row Level Security

## Desenvolvimento local

1. Instale Node.js LTS.
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local` e configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` de um projecto Supabase dedicado ao Quitaia Market.
4. Aplique, por ordem, os ficheiros SQL em `supabase/migrations/` no Supabase desse projecto.
5. Execute `npm run dev`.
6. Antes de lançar, execute `npm run typecheck` e `npm run build`, corrija todos os erros e teste com uma conta real de teste.

## Configuração obrigatória antes de usar

- Activar Phone Auth e configurar um fornecedor SMS real no Supabase.
- Aplicar migrations e inspeccionar as políticas RLS e de Storage no Supabase.
- Confirmar upload/consulta de fotografias, anúncios pausados/vendidos e limites das imagens.
- Rever definições de privacidade do repositório GitHub. O repositório está actualmente público.

## Segurança

Nunca adicionar `service_role`, tokens ou segredos ao frontend nem ao Git. Só a chave publicável/anon deve existir no cliente e apenas com políticas RLS correctas.

## Estado honesto

O código inicial foi enviado para GitHub, mas a compilação, testes end-to-end, integração com um backend Supabase activo e publicação ainda não foram confirmados. Não considerar pronto para produção até essas verificações passarem.
