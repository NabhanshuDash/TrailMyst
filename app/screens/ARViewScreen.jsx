import { ViroARSceneNavigator } from '@viro-community/react-viro';
import ARScene from './ARScene';

export default function ARViewScreen() {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{ scene: ARScene }}
      style={{ flex: 1 }}
    />
  );
}
