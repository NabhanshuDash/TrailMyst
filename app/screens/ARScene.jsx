import {
    ViroARScene,
    Viro3DObject,
    ViroAmbientLight,
  } from '@viro-community/react-viro';
  
  export default function ARScene() {
    return (
      <ViroARScene>
        <ViroAmbientLight color="#fff" />
        <Viro3DObject
          source={require('../assets/chest.obj')}
          resources={[require('../assets/chest.mtl')]}
          position={[0, -0.5, -1]}
          scale={[0.2, 0.2, 0.2]}
          type="OBJ"
        />
      </ViroARScene>
    );
  }
  