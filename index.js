const path = require("path");
const process = require("process");
const { google } = require("googleapis");

//const { createCoreController } = require("@strapi/strapi").factories;
const modelUid = "api::applicant.applicant";

//module.exports = {
//init(providerOptions) {
//return {
//async function upload(file) {
async function upload(ctx, SERVICE_ACCOUNT_PATH) {
  // const SERVICE_ACCOUNT_PATH = path.join(
  //   process.cwd(),
  //   "service_account.json"
  // );
  // console.log(SERVICE_ACCOUNT_PATH);
  const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
  const GOOGLEACCOUNT = "meenashi.s@devlaunchers.com";

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: SCOPES,
  });

  const service = google.drive({ version: "v3", auth });
  //console.log("after service");
  //console.log(service);

  const FOLDERID = "1jN1_Crat6nkpakD0BZsE3xKAIkJ26NE2";

  const {
    request: { body, files: { files } = {} },
  } = ctx;
  //console.log(files.name);
  //console.log(files.type);
  //console.log(files.path);
  const uploadSingleFile = async (fileName, fileType, filePath) => {
    const fsnp = require("fs");

    const fileMetadata = {
      name: fileName,
      parents: FOLDERID,
      mimeType: fileType, //mime-types to get the file types
    };

    //console.log(fileMetadata);
    const media = {
      mimeType: fileType,
      body: fsnp.createReadStream(filePath),
    };
    console.log(media);
    try {
      const response = await service.files.create({
        resource: {
          name: fileName,
          parents: [FOLDERID],
        },
        requestBody: fileMetadata,
        media: media,
      });
      console.log(response.data.id);
      //ctx.response.status = 200;
      //ctx.response.message =
      //  response.data.id + " I Google Upload Response Success";

      const permissionFiles = async () =>
        await service.permissions.create({
          fileId: response.data.id,
          resource: {
            type: "user",
            role: "reader",
            emailAddress: GOOGLEACCOUNT,
          },
        });
      //console.log(permissionFiles);

      //ctx.response.status = 200;
      //ctx.response.message =
      //  response.data.id + " Per Google Upload Response Success";

      return response;
    } catch (error) {
      console.log(error.message);
      return error;
    }
  };
  //return
  try {
    const uploadResponse = await uploadSingleFile(
      files["name"],
      files["type"],
      files.path
    );
    //console.log(uploadResponse);
    return uploadResponse;
  } catch (err) {
    ctx.throw(533, err);
    console.log(`error in upload ${err}`);
  }

  // return new Promise(async (resolve, reject) => {
  //console.log("inside upload(file) below");
  //console.log(file);
  //console.log("inside upload(file) above");
}
async function getAll(SERVICE_ACCOUNT_PATH) {
  const SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"];
  //https://www.googleapis.com/auth/drive.metadata.readonly
  //const GOOGLEACCOUNT = "meenashi.s@devlaunchers.com";
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: SCOPES,
  });

  const service = google.drive({ version: "v3", auth });
  //console.log("after service");
  //console.log(service);

  const FOLDERID = "1jN1_Crat6nkpakD0BZsE3xKAIkJ26NE2";

  const res = await service.files.list({
    pageSize: 10,
    fields: "nextPageToken, files(id, name)",
  });
  //console.log(res.status)
  //console.log(res.statusText);
  //console.log(res.data.files)
  const files = res.data.files;
  if (files.length === 0) {
    console.log("No files found.");
    return;
  }

  //console.log("Files:");
  // files.map(async (file) => {
  //   console.log(`${file.name} (${file.id}) (${file}) `);
  //      const permissionFiles = await service.permissions.create({
  //        fileId: file.id,
  //        resource: { type: "user", role: "reader", emailAddress: GOOGLEACCOUNT },
  //      });
  //      console.log(permissionFiles);
  //});
  return res;
  //ctx.response.status = 200;
  //ctx.response.message = "Google Upload Response Success";
  // return new Promise(async (resolve, reject) => {
  //  console.log("inside getAll below");

  //  console.log("inside getAll above");
  //  return {"name":"Sathya", "type":"doc"}
}

async function deleteFile(ctx, SERVICE_ACCOUNT_PATH) {
  //const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), "service_account.json");
  //console.log(SERVICE_ACCOUNT_PATH);
  const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: SCOPES,
  });

  const service = google.drive({ version: "v3", auth });
  console.log(ctx.request.query);
  const response = await service.files.delete({
    fileId: ctx.request.query.fileId,
  });
  return response;
}
/*async function deleteFile(file) {
  // return new Promise(async (resolve, reject) => {
     console.log("inside deleteFile(file) below");
     console.log(file);
     console.log("inside deleteFile(file) above");
 
 } */
module.exports = { upload, getAll, deleteFile };
//  };
// },
//};
/*
function helloNpm() {
  return "hello are you here";
}

module.exports = helloNpm;
*/
