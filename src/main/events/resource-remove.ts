import { resourcesRemove } from '../commands';
import { socketCommandStatus } from '../socket';

export function eventResourceRemove(resource: Resource, mainWindow) {
  const updatedResources = resourcesRemove(resource.hash);
  socketCommandStatus({
    type: 'resources:remove',
    status: 'success',
    resource,
  });
  socketCommandStatus({
    type: 'resources:list',
    resources: updatedResources,
  });
  mainWindow.webContents.send('resource-remove', {
    resource,
  });
}
