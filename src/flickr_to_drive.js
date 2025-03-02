function main() {
  var apiKey = 'xxxx';
  var apiSecret = 'xxxx';
  var userIdAgenciaSenado = 'xxx';
  var rootFolderId = 'xxxxxxx';
  var listaSenadores = ["Astronauta Marcos Pontes"];
  
  var logs = [];
  var email = "carlos.antunes@senado.leg.br";

  try {
    logs.push("Iniciando processo de autenticação no Flickr...");
    var flickr = FlickrApp(apiKey, apiSecret); // Autenticação no Flickr
    
    logs.push("Obtendo todos os albums do usuário Agência Senado...");
    var sets = flickr.photosets.getList({ user_id: userIdAgenciaSenado });
    
    // Obtém a data do dia anterior para comparar
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
  
    for (var i = 0; i < sets.photosets.photoset.length; i++) {
      var photosetId = sets.photosets.photoset[i].id;
      var photosetCreatedDate = new Date(Number(sets.photosets.photoset[i].date_create) * 1000);
     
      // Verifica se o album é do dia anterior e se já foi processado
      if (isSameDay(photosetCreatedDate, yesterday)) {
          var photosetTitle = sets.photosets.photoset[i].title._content;
          if (!isAlbumProcessed(rootFolderId, photosetTitle)) {
              logs.push("Processando album: " + photosetTitle);
              checkPhotoset(flickr, photosetId, listaSenadores, rootFolderId, photosetTitle, logs);
          } else {
              logs.push("Album " + photosetTitle + " já foi processado anteriormente.");
          }
      }
    }

    logs.push("Processamento concluído com sucesso.");
  } catch (error) {
    logs.push("Erro durante o processamento: " + error.message);
  } finally {
    var folderUrl = DriveApp.getFolderById(rootFolderId).getUrl();
    logs.push("Link da pasta do Google Drive: " + folderUrl);
    sendEmailReport(logs, email, folderUrl);
  }
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function isAlbumProcessed(rootFolderId, albumTitle) {
  var rootFolder = DriveApp.getFolderById(rootFolderId);
  var folders = rootFolder.getFoldersByName(albumTitle);
  return folders.hasNext();
}

function checkPhotoset(flickr, photosetId, listaSenadores, rootFolderId, photosetTitle, logs) {
  var photoset = flickr.photosets.getPhotos({ photoset_id: photosetId });
  var albumFolderId = createFolder(rootFolderId, photosetTitle, logs);
  var albumSize = photoset.photoset.photo.length;
  
  for (var i = 0; i < albumSize; i++) {
    var photoId = photoset.photoset.photo[i].id;
    var photoInfo = flickr.photos.getInfo({ photo_id: photoId });
    var photoDesc = photoInfo.photo.description._content;
    var containsSenador = listaSenadores.some(senador => photoDesc.includes(senador));

    if (containsSenador) {
      logs.push("Foto " + photoId + " contém descrição com um dos senadores.");
      var photoSizes = flickr.photos.getSizes({ photo_id: photoId });
      var photoUrlDownload = photoSizes.sizes.size[photoSizes.sizes.size.length - 1].source;
      var photoFilename = photoId + '.jpg';
      
      var imgBlob = UrlFetchApp.fetch(photoUrlDownload).getBlob();
      var imgFile = DriveApp.getFolderById(albumFolderId).createFile(imgBlob).setName(photoFilename);
      
      for (var j = 0; j < listaSenadores.length; j++) {
        var senador = listaSenadores[j];
        if (photoDesc.includes(senador)) {
          var senadorFolderId = createFolder(albumFolderId, senador, logs);
          imgFile.makeCopy(DriveApp.getFolderById(senadorFolderId));
          savePhotoInfo(senadorFolderId, photoInfo, photoFilename, photoUrlDownload, logs);
        }
      }
    } else {
      logs.push("Foto " + photoId + " não contém descrição com senadores.");
    }
  }
}

function createFolder(parentFolderId, folderName, logs) {
  var parentFolder = DriveApp.getFolderById(parentFolderId);
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    logs.push("Pasta " + folderName + " já existe.");
    return folders.next().getId();
  } else {
    logs.push("Criando pasta " + folderName + "...");
    var newFolder = parentFolder.createFolder(folderName);
    return newFolder.getId();
  }
}

function savePhotoInfo(folderId, photoInfo, photoFilename, photoUrl, logs) {
  var photoTitle = photoInfo.photo.title._content;
  var photoDesc = photoInfo.photo.description._content;
  var photoDate = photoInfo.photo.dates.taken;
  
  var txtContent = photoTitle + '\n\n' + photoDesc + '\n\nLink original: ' + photoUrl;
  var txtBlob = Utilities.newBlob(txtContent, 'text/plain', photoFilename.replace('.jpg', '.txt'));
  DriveApp.getFolderById(folderId).createFile(txtBlob);
  logs.push("Informações da foto " + photoFilename + " salvas.");
}

function sendEmailReport(logs, email, folderUrl) {
  var subject = "Relatório de Processamento do Script Flickr para Google Drive";
  var body = logs.join('\n');

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: body,
    noReply: true
  });
  
  Logger.log("Relatório de e-mail enviado para " + email);
}

function FlickrApp(apiKey, apiSecret) {
  this.apiKey = apiKey;
  this.apiSecret = apiSecret;
  this.baseUrl = 'https://api.flickr.com/services/rest/';
  
  this.callMethod = function(method, params) {
    params.api_key = this.apiKey;
    params.format = 'json';
    params.nojsoncallback = 1;
    params.method = method;
    
    var queryString = Object.keys(params).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    
    var response = UrlFetchApp.fetch(this.baseUrl + '?' + queryString);
    return JSON.parse(response.getContentText());
  };
  
  this.photosets = {
    getList: (params) => this.callMethod('flickr.photosets.getList', params),
    getPhotos: (params) => this.callMethod('flickr.photosets.getPhotos', params)
  };
  
  this.photos = {
    getInfo: (params) => this.callMethod('flickr.photos.getInfo', params),
    getSizes: (params) => this.callMethod('flickr.photos.getSizes', params)
  };
  
  return this;
}
