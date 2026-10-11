# Privacidade e segurança dos anúncios — Quitaia Market

Este documento descreve o comportamento previsto para a versão inicial. Não constitui aconselhamento jurídico e deve ser revisto à luz da legislação angolana antes do lançamento público.

## Dados pessoais na versão actual

- O número de telefone é utilizado para autenticação por código SMS no Supabase.
- O vendedor pode adicionar, de forma opcional, um número WhatsApp a um anúncio. O formulário avisa que este contacto ficará visível a quem consultar o anúncio. O telefone privado usado no login não é preenchido automaticamente no anúncio.
- O nome de apresentação e a cidade do perfil destinam-se a ser visíveis apenas ao próprio utilizador, de acordo com as políticas de base de dados.
- Título, preço, descrição, cidade, categoria e fotografias de anúncios activos destinam-se a ser visíveis aos visitantes.
- Os IDs dos anúncios guardados como favoritos ficam no armazenamento local do navegador desse dispositivo.

## Acesso às fotografias

As fotografias devem permanecer no bucket privado `product-images`. O cliente solicita URLs assinados de curta duração; a política de leitura deve permitir o acesso público apenas às imagens referenciadas por anúncios activos. Não tornes o bucket público, pois URLs públicos de objectos ultrapassam estas políticas de leitura.

## Segurança e moderação

O formulário de denúncia e a tabela privada de denúncias já existem. Antes do lançamento público, implementar a fila administrativa de moderação, regras operacionais sobre artigos proibidos, bloqueio de vendedores e canal de contacto para abusos. Definir como as denúncias são analisadas e como anúncios ou contas podem ser restringidos.

## Ciclo de vida dos dados

Antes do lançamento, definir regras de retenção e eliminação de dados da conta, anúncios e ficheiros carregados. Testar se a remoção de um anúncio elimina também as referências de imagens e os ficheiros de armazenamento. A versão actual usa remoção lógica dos anúncios e tenta limpar as imagens; a eliminação completa da conta ainda não está implementada.

## Requisitos de lançamento

Publicar aviso de privacidade e termos de utilização em português, explicando o que é público, como retirar um contacto WhatsApp ao editar/remover o anúncio, como solicitar eliminação da conta e como denunciar abusos. Os textos integrados na aplicação são preliminares e precisam de revisão jurídica antes de aceitar utilizadores reais.
