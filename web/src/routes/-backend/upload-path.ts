import {UploadModel} from "seadox-shared/api";
import {apiPrefix} from "@/routes/-backend/backend-client.ts";


export default function uploadPath(upload: UploadModel) {
    return apiPrefix + '/uploads/' + upload.id;
}