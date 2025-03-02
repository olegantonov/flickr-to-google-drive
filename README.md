Flickr to Google Drive
Este projeto automatiza o processo de transferência de fotos do Flickr para o Google Drive. Ele verifica os álbuns do Flickr criados no dia anterior, filtra fotos com base em palavras-chave (nomes de senadores) e as organiza automaticamente no Google Drive.
---
📌 Funcionalidades
✅ Autenticação na Flickr API para obter álbuns de um usuário específico.
✅ Filtragem de fotos por descrição para encontrar imagens relacionadas a senadores.
✅ Download e armazenamento automático das fotos no Google Drive, organizadas por álbum e senador.
✅ Criação de arquivos de texto com informações detalhadas sobre cada foto.
✅ Envio de um relatório por e-mail com os logs do processamento.
---
🛠️ Tecnologias Utilizadas
Google Apps Script
Flickr API
Google Drive API
Google Mail API
---
🚀 Como Usar
1️⃣ Configurar a API do Flickr
Acesse o Flickr API Manager.
Gere uma API Key e um API Secret.
No código, substitua os valores das variáveis:
javascript
Copiar
Editar
var apiKey = 'SUA_API_KEY';
var apiSecret = 'SEU_API_SECRET';
---
2️⃣ Configurar a Pasta no Google Drive
Crie uma pasta no Google Drive para armazenar as fotos.
Copie o ID da pasta (ele está na URL do Google Drive, após folders/).
No código, substitua:
javascript
Copiar
Editar
var rootFolderId = 'SEU_FOLDER_ID';
---
3️⃣ Definir os Senadores a Serem Monitorados
No código, localize a variável listaSenadores.
Adicione ou remova nomes conforme necessário:
javascript
Copiar
Editar
var listaSenadores = ["Astronauta Marcos Pontes", "Outro Nome"];
---
4️⃣ Executar o Script
Acesse Extensões > Apps Script no Google Sheets.
Cole o código no editor do Google Apps Script.
Execute a função main() para iniciar o processamento.
📄 Licença
Este projeto é distribuído sob a licença MIT.

✍️ Autor
Daniel Marques

