
var plussaGuiFileManager = (function() {

  var userProjects = new Map(); // All user projects.
  var projectJSONs = new Map(); // Root file trees of every loaded user project.
  var folderJSONs = new Map(); // Project id keys map folder JSON maps, which in turn have folder paths as keys.
  var fileJSONs = new Map(); // All downloaded file contents with file id (SHA value) keys.

  function findFileJSON(mapId) {
    var file = fileJSONs.get(mapId);
    if(file != undefined) {
      return file;
    }
    else {
      return false;
    }
  }

  function findFolder(projectId, folderPath) {
    var projectFolders = folderJSONs.get(projectId);
    if(projectFolders != undefined) {
      var folder = projectFolders.get(folderPath);
      if(folder != undefined) {
        return folder;
      }
    }
    return false;
  }

  function findUserProject(projectId) {
    var project = userProjects.get(projectId);
    if(project != undefined) {
      return project;
    }
    else {
      return false;
    }
  }

  function findProjectRootFolder(projectId) {
    var rootFolder = projectJSONs.get(projectId);
    if(rootFolder != undefined) {
      return rootFolder;
    }
    else {
      return false;
    }
  }

  function findFoldersForProject(projectId) {
    var projectFolders = folderJSONs.get(projectId);
    if(projectFolders != undefined) {
      return projectFolders; // Map with folder paths as keys
    }
    else {
      return folder;
    }
  }

  function findFolderForFile(projectId, filePath) {
    var lastIndexOfSlash = filePath.lastIndexOf('/');
    /* Check if the file resides in the project root folder i.e. if it does not
     * have a slash character in the file path. */
    if(lastIndexOfSlash == -1) {
      return findProjectRootFolder(projectId); // Get the project root folder.
    }
    else {
      var folderPath = filePath.substring(0, lastIndexOfSlash);
      return findFolder(projectId, folderPath);
    }
  }

  function deleteFileMetaData(projectId, filePath) {
    console.log("Before: \n"+JSON.stringify(findFolderForFile(projectId, filePath)));
    var folderJSONarray = findFolderForFile(projectId, filePath);
    var i = 0;
    var l = folderJSONarray.length;
    for(i = 0; i < l; ++i) {
      if(folderJSONarray[i].path == filePath) {
        folderJSONarray.splice(i, 1);
        var lastIndexOfSlash = filePath.lastIndexOf('/');
        if(lastIndexOfSlash == -1) {
          // Update project root folder.
          projectJSONs.set(projectId, folderJSONarray);
        }
        else {
          // Update project sub folder.
          var folderPath = filePath.substring(0, lastIndexOfSlash);
          (folderJSONs.get(projectId)).set(folderPath, folderJSONarray);
        }
        console.log("After: \n"+JSON.stringify(findFolderForFile(projectId, filePath)));
        return true;
      }
    }
    return false;
  }

  // Save user's GitLab projects as a map with project id keys
  var setUserProjects = function(projectsMetaJSON) {
    for(i in projectsMetaJSON) {
      userProjects.set(""+projectsMetaJSON[i].id, projectsMetaJSON[i]);
    }
  }

  var saveProjectJSON = function(projectId, fileTreeJSON) {
    projectJSONs.set(projectId, fileTreeJSON);
  }

  var getProjectMetaData = function(projectId) {
    var projectMeta = findUserProject(projectId);
    if(projectMeta) {
      return {
        id: projectId,
        name: projectMeta.name,
        default_branch: projectMeta.default_branch,
        created_at: projectMeta.created_at,
        last_activity_at: projectMeta.last_activity_at,
        owner_name: projectMeta.owner.name
      }
    }
    return false;
  }

  var saveFolderJSON = function(projectId, path, content) {;
    if(!folderJSONs.has(projectId)) {
      // No previous sub folders loaded for this project id, make a new entry
      folderJSONs.set(projectId, new Map());
    }
    (folderJSONs.get(projectId)).set(path, content);
  }

  var isProjectLoaded = function(projectId) {
    return findProjectRootFolder(projectId);
  }

  var isFolderLoaded = function(projectId, path) {
    return findFolder(projectId, path);
  }

  var getFileMetaData = function(projectId, filePath) {
    var folderJSON = findFolderForFile(projectId, filePath);
    if(folderJSON) {
      for(item in folderJSON) {
        if(folderJSON[item].path == filePath) {
          return folderJSON[item]; // File meta data.
        }
      }
    }
    else {
      return false;
    }
  }

  function addNewFileMetaData(projectId, filePath) {
    var newFileMetaJSON = {
      id: 0,
      name: "",
      type: "blob",
      path: filePath,
      mode: "100644"
    }
    var pathInfo = plussaGuiFileManager.explodeFilePath(filePath);
    /* If the file has no folder path it resides in the project root folder. */
    if(!pathInfo) {
      newFileMetaJSON.name = filePath;
      (projectJSONs.get(projectId)).push(newFileMetaJSON); // Add new file meta data JSON to the project root folder.
      //folder.push(newMetaJSON);
      //projectJSONs.set(projectId, folder);
    }
    else {
      newFileMetaJSON.name = pathInfo[1];
      var folderJSON = findFolder(projectId, pathInfo[0]);
      if(folderJSON) {
        folderJSON.push(newFileMetaJSON);
      }
      else {
        // No previous folder data, save new folder metadata.
        var newFolderMetaJSON = {
          id: 0,
          name: "",
          type: "tree",
          path: pathInfo[0],
          mode: "040000"
        }
        var folderInfo = plussaGuiFileManager.explodeFilePath(pathInfo[0]);
        if(!folderInfo) {
          // New subfolder for project root folder.
          newFolderMetaJSON.name = pathInfo[0];
          (projectJSONs.get(projectId)).push(newFolderMetaJSON);
        }
        else {
          newFolderMetaJSON.name = folderInfo[1];
          (folderJSONs.get(projectId)).set(pathInfo[0],[newFileMetaJSON]);
          (findFolder(projectId, folderInfo[0])).push(newFolderMetaJSON);
        }
      }
    }
  }

  var saveFileJSON = function(mapId, fileJSON) {
    fileJSONs.set(mapId, fileJSON);
  }

  function saveNewFileJSON(mapId, newContent) {
    var fileJSON = {
      size: newContent.length,
      encoding: "base64",
      content: btoa(newContent),
      sha:0
    }
    fileJSONs.set(mapId, fileJSON);
  }

  function updateFileJSON(mapId, newContent) {
    var file = fileJSONs.get(mapId);
    file.size = newContent.length;
    file.content = btoa(newContent);
    file.sha = 0;
    fileJSONs.set(mapId, file);
  }

  var isFileLoaded = function(mapId) {
    var result = findFileJSON(mapId);
    if(result) {
      return result.content;
    }
    else {
      return false;
    }
  }

  var updateAfterFileDelete = function(projectId, filePath) {
    fileJSONs.delete(projectId + filePath); // Remove file content from File Manager.
    deleteFileMetaData(projectId, filePath);
  }

  var updateAfterFileSave = function(projectId, filePath, newContent) {
    var mapId = projectId + filePath;
    // Update file content if the file path for the project exists.
    if(fileJSONs.has(mapId)) {
      updateFileJSON(mapId, newContent);
    }
    else {
      saveNewFileJSON(mapId, newContent);
      addNewFileMetaData(projectId, filePath);
    }
  }

  var explodeFilePath = function(filePath) {
    var lastIndexOfSlash = filePath.lastIndexOf('/');
    if(lastIndexOfSlash != -1) {
      return [filePath.substring(0, lastIndexOfSlash), filePath.substring(lastIndexOfSlash+1, filePath.length)];
    }
    else {
      return false;
    }
  }

  // Public File Manager API
  return {
      setUserProjects: setUserProjects,
      saveProjectJSON: saveProjectJSON,
      getProjectMetaData: getProjectMetaData,
      saveFolderJSON: saveFolderJSON,
      isProjectLoaded: isProjectLoaded,
      isFolderLoaded: isFolderLoaded,
      getFileMetaData: getFileMetaData,
      saveFileJSON: saveFileJSON,
      updateAfterFileDelete: updateAfterFileDelete,
      updateAfterFileSave: updateAfterFileSave,
      isFileLoaded: isFileLoaded,
      explodeFilePath: explodeFilePath
  };
})();
