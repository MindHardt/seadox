import {UploadModel} from "seadox-shared/api";

export default function uploadPath(upload: UploadModel) {
    return '/api/uploads/' + upload.id;
}