import { Socket } from 'socket.io-client';
import { downloadFile } from '../download-file';
import { Resources } from '../store';
import { BrowserWindow } from 'electron';
import { getDirectories } from '../store';

type ResourcesAddPayload = {
  type: Resources;
  id: string;
  hash: string;
  name: string;
  modelName: string;
  modelVersionName: string;
  url: string;
};

type ResourcesAddParams = { payload: ResourcesAddPayload; socket: Socket; mainWindow: BrowserWindow };

export function resourcesAdd(params: ResourcesAddParams) {
  console.log('ResourcesAdd');
  const payload = params.payload;
  const directories = getDirectories() as { [key: string]: string };
  const resourcePath = directories[payload.type.toLowerCase()] || directories['model'] + '/Lora';

  // TODO: Firing twice
  params.mainWindow.webContents.send('resource-add', { ...payload });

  downloadFile({
    id: payload.id,
    name: payload.name,
    url: payload.url,
    downloadPath: resourcePath,
    socket: params.socket,
    mainWindow: params.mainWindow,
  });
  // TODO: resource.type determines path to download
}

// if resource['type'] == 'Checkpoint': load_model(resource, on_progress)
// elif resource['type'] == 'CheckpointConfig': load_model_config(resource, on_progress)
// elif resource['type'] == 'Controlnet': load_controlnet(resource, on_progress)
// elif resource['type'] == 'Upscaler': load_upscaler(resource, on_progress)
// elif resource['type'] == 'Hypernetwork': load_hypernetwork(resource, on_progress)
// elif resource['type'] == 'TextualInversion': load_textual_inversion(resource, on_progress)
// elif resource['type'] == 'LORA': load_lora(resource, on_progress)
// elif resource['type'] == 'LoCon': load_locon(resource, on_progress)

// command {
//   type: 'resources:add',
//   resource: {
//     type: 'LORA',
//     hash: '267766584458498FF1598EFB104858FAAF61F40ADC7A698A6BB3AF2A1DF53EF9',
//     name: 'wrenchleafloom.safetensors',
//     modelName: "Arc en Gowns | A wrench's Gown Collection",
//     modelVersionName: 'leafloom',
//     url: 'https://civitai-delivery-worker-prod.5ac0637cfd0766c97916cefa3764fbdf.r2.cloudflarestorage.com/model/969069/wrenchleafloom.v3Ev.safetensors?X-Amz-Expires=86400&response-content-disposition=attachment%3B%20filename%3D%22wrenchleafloom.safetensors%22&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=e01358d793ad6966166af8b3064953ad/20240123/us-east-1/s3/aws4_request&X-Amz-Date=20240123T174830Z&X-Amz-SignedHeaders=host&X-Amz-Signature=e04ae6084c037ba3b65a809f8d9fc08efbe3afc47bd6172ba815cb77bbc48480'
//   },
//   id: '6245ce55-888f-4a13-a5ca-f8e5e8c884d6',
//   createdAt: '2024-01-23T17:48:30.637Z'
// }
