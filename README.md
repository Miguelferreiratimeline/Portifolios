# MF FRAME V10 — Seis vídeos publicados no portfólio

Esta versão deriva diretamente da V09 e preserva o layout, o Liquid Glass, as molas físicas, a navegação e o easter egg.

## Ordem aprovada (exatamente como enviada)
1. Minecraft — Gameplay 01: https://youtu.be/nBqsqlc80PM
2. Minecraft — Gameplay 02: https://youtu.be/Vi__0QMytt8
3. Intro de vídeo: https://youtu.be/qiP5ZyS-pw0
4. Gameplay Edit: https://youtu.be/CoSm1BUZ6qA
5. Vídeo profissional vertical: https://youtube.com/shorts/s-DYr0KgQ20?feature=share
6. Vídeo curto infantil: https://www.youtube.com/shorts/DncdZjsns64

## Implementação
- As URLs estão em `videos.js`.
- O player abre sob demanda (modo privacidade aprimorada do YouTube).
- Vídeos verticais abrem em player 9:16.
- Links diretos ao YouTube funcionam independentemente do player embutido.
- O primeiro Minecraft utiliza a miniatura local preservada do site antigo. Gameplay Edit também usa miniatura local.
- Os quatro novos vídeos carregam miniaturas de `i.ytimg.com`, com cartaz tipográfico de fallback caso a conexão bloqueie a imagem.
- Foram removidos da galeria os projetos antigos que não correspondiam aos seis links enviados.
- Fotografia permanece em página separada e não aparece na página de edição.

## Observação
A disponibilidade de reprodução de cada vídeo e a visualização de miniaturas dependem das permissões e da conectividade do YouTube. Os URLs foram integrados exatamente como enviados, mas o acesso remoto não pôde ser confirmado no ambiente de criação.

## Teste local
Descompacte o ZIP, abra `MF-FRAME-v10-VIDEOS/edicao/index.html` ou execute `python -m http.server 8000` na pasta do projeto e navegue para `http://localhost:8000/edicao/`.
