# Quitaia Market — lista de verificação para lançamento

## Repositório e build
- [x] Aplicação React + TypeScript + Vite enviada para a branch `main`.
- [x] GitHub Actions executa instalação bloqueada, auditoria de dependências, TypeScript, testes unitários e build de produção.
- [x] Formato monetário testado como `24.999,00 Kz`.
- [x] Ficheiro `package-lock.json` guardado e validado em CI.
- [ ] Confirmar que a visibilidade do repositório corresponde à intenção do proprietário; neste momento está público.

## Supabase
- [ ] Criar um projecto Supabase dedicado ao Quitaia Market (não reutilizar outros projectos).
- [ ] Aplicar as três migrações por ordem e executar o seed das categorias.
- [ ] Configurar OTP por telefone e fornecedor SMS com entrega para números angolanos.
- [ ] Configurar os URLs de autenticação permitidos.
- [ ] Testar RLS com duas contas independentes, incluindo tentativas de leitura e alteração de dados de outro utilizador.
- [ ] Confirmar que categorias inactivas não podem ser usadas em anúncios novos ou reactivados.
- [ ] Confirmar bucket privado, expiração das URLs assinadas e acesso após pausa/remoção.
- [ ] Rever os Security e Performance Advisors do Supabase.

## Aceitação funcional
- [ ] Testar OTP válido/inválido, repetição do envio, logout e persistência após actualizar a página.
- [ ] Criar, editar, pausar, reactivar, marcar como vendido e remover um anúncio.
- [ ] Testar 0, 1 e 9 fotografias; rejeitar 10, tipos não suportados e originais demasiado grandes.
- [ ] Confirmar compressão, mensagens de erro e limpeza de ficheiros que ficarem órfãos.
- [ ] Confirmar que anúncios activos aparecem publicamente e os pausados/vendidos apenas na gestão do vendedor.
- [ ] Testar o contacto WhatsApp opcional com números de teste reais.
- [ ] Testar responsividade, navegação por teclado, acessibilidade e estados de carregamento/erro/vazio.

## Antes do lançamento
- [x] Implementar formulário de denúncia e tabela privada com RLS.
- [ ] Construir fila administrativa de moderação, bloqueio de vendedores e regras operacionais para artigos proibidos.
- [x] Adicionar ao app páginas preliminares de privacidade e termos.
- [ ] Publicar versões finais da privacidade e dos termos revistos juridicamente em Angola.
- [ ] Definir contacto de suporte e processo de eliminação de dados/conta.
- [ ] Confirmar visibilidade do repositório e domínio de produção.
- [ ] Executar testes end-to-end num projecto Supabase de staging antes da publicação final.
