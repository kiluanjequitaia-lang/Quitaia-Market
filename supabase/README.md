# Supabase — Quitaia Market

Usa um projecto Supabase dedicado ao marketplace. Não reutilizes a base de dados do UBUNTU, Escola IA, CaixaFácil ou qualquer outro projecto.

## Aplicar o esquema

1. Abre o SQL Editor do projecto Supabase dedicado.
2. Executa `migrations/0001_marketplace_phase1.sql`.
3. Executa `migrations/0002_storage_policy_hardening.sql`.
4. Executa `migrations/0003_product_category_guardrails.sql`.
5. Executa `seed.sql) para inserir apenas as categorias iniciais.
6. Inspecciona as tabelas e as políticas RLS no painel.

## Autenticação

- Activa Phone Auth.
- Configura um fornecedor SMS real e confirma a entrega de mensagens para números angolanos +244.
- Configura os URLs de redireccionamento permitidos para desenvolvimento e para o domínio final.
- Não reduzas as protecções de OTP apenas para facilitar o desenvolvimento.

## Armazenamento e RLS

- O bucket `product-images` é privado, tem limite de 5 MiB por ficheiro e aceita apenas JPEG, PNG e WebP. A aplicação pede URLs assinados de curta duração para fotografias de anúncios activos.
- Cada vendedor só pode carregar ficheiros para um caminho iniciado pelo seu ID autenticado.
- A migração 0002 restringe a leitura das fotografias públicas assinadas às imagens associadas a anúncios activos, mantendo a leitura do proprietário.
- Testa as políticas com duas contas diferentes. Nenhuma conta deve poder consultar ou modificar os anúncios pausados/vendidos de outra conta; apenas anúncios activos são visíveis publicamente.

## Verificação antes do lançamento

- [ ] Testar envio de OTP, código inválido, código válido, nova tentativa, logout e persistência de sessão.
- [ ] Testar publicação com 0, 1 e 9 fotografias e rejeitar a 10.ª.
- [ ] Testar falhas de compressão/upload e confirmar que a interface informa correctamente o resultado.
- [ ] Testar editar, pausar, reactivar, marcar como vendido e remover um anúncio.
- [ ] Confirmar que anúncios pausados/vendidos aparecem apenas na gestão do proprietário e desaparecem do feed público.
- [ ] Executar os Security e Performance Advisors do Supabase e resolver alertas relevantes.
