# Quitaia Market

Marketplace mobile-first para Angola, em português de Angola, com preços em Kz no formato `24.999,00 Kz` e identidade visual verde/dourada.

## Estrutura

- `src/App.tsx`: feed, categorias, pesquisa, favoritos locais persistentes, autenticação por OTP, perfil, publicação/edição e gestão dos próprios anúncios.
- `src/lib/`: cliente Supabase, formatação Kz e validação de números angolanos.
- `supabase/migrations/`: esquema, políticas RLS, armazenamento privado e guardrails de categorias.
- `supabase/seed.sql`: categorias iniciais apenas — sem anúncios fictícios.
- `supabase/tests/`: testes estáticos de invariantes de segurança das migrações.
- `docs/`: checklist de lançamento, segurança e textos preliminares de privacidade/termos.
- `.github/workflows/ci.yml`: instalação reproduzível, auditoria de dependências, TypeScript, testes e build.

## Tecnologias

- React 18, TypeScript e Vite.
- Tailwind CSS 4.
- Supabase Auth, PostgreSQL, Storage e Row Level Security.

## Desenvolvimento local

1. Instala Node.js 22 ou uma versão LTS compatível.
2. Executa `npm ci` para instalar as dependências bloqueadas em `package-lock.json`.
3. Copia `.env.example` para `.env.local` e configura `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` de um projecto Supabase **dedicado** ao Quitaia Market. Não reutilizes o backend de outras aplicações e nunca coloques uma chave `service_role` no frontend.
4. Confirma que estás no projecto correcto, aplica por ordem os quatro ficheiros SQL em `supabase/migrations/` (`0001` a `0004`) e depois executa `supabase/seed.sql`.
5. Activa Phone Auth e configura um fornecedor SMS real antes de testar autenticação.
6. Executa `npm run typecheck`, `npm test`, `npm run build` e depois `npm run dev`.

## Estado técnico verificado

A pipeline do GitHub Actions executa `npm ci`, `npm audit --audit-level=low`, `npm run typecheck`, `npm test` e `npm run build`. A execução validada mais recente concluiu estes passos com sucesso e a auditoria reportou zero vulnerabilidades nas dependências instaladas.

Isto valida o código e os testes automatizados; **não** substitui testes end-to-end contra um projecto Supabase real. O backend ainda não foi criado nem configurado, o fornecedor SMS não foi activado e a aplicação ainda não foi publicada.

## Antes de usar com clientes

- Criar um projecto Supabase separado (não reutilizar UBUNTU, Escola IA, CaixaFácil ou outros projectos).
- Aplicar e rever as migrações, testar RLS com duas contas e executar os Security/Performance Advisors do Supabase.
- Testar OTP +244, carregamento e remoção de fotografias, estados de anúncios e contacto WhatsApp.
- Rever os textos preliminares de privacidade/termos com apoio jurídico em Angola e definir um canal de suporte e de denúncias.
- Confirmar a visibilidade do repositório. Neste momento, o GitHub reporta este repositório como público; se a intenção for privada, alterar a visibilidade nas definições do GitHub.

## Segurança

Nunca guardes chaves `service_role`, tokens ou segredos no frontend ou no Git. Só uma chave publicável/anon pode estar no cliente e apenas com políticas RLS correctas.

**Não considerar pronto para produção** até o backend real, a autenticação SMS, os testes funcionais e a revisão legal estarem concluídos.
