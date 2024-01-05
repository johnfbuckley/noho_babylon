window.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = function () {
    var scene = new BABYLON.Scene(engine);

        // Enable collision on the scene
        scene.collisionsEnabled = true;

            // Create a FreeCamera and set its position
            var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 1.5, -4), scene);

            // Set the target of the camera to the origin
            camera.setTarget(new BABYLON.Vector3(0, 1.5, 1));

            // Enable collision on the camera and attach it to the canvas
            camera.checkCollisions = true;
            camera.attachControl(canvas, false);

            // Set the keys for moving
            camera.keysUp = ['W'.charCodeAt(0), 'w'.charCodeAt(0)];    // "W"
            camera.keysDown = ['S'.charCodeAt(0), 's'.charCodeAt(0)];  // "S"
            camera.keysLeft = ['A'.charCodeAt(0), 'a'.charCodeAt(0)];  // "A"
            camera.keysRight = ['D'.charCodeAt(0), 'd'.charCodeAt(0)]; // "D"

            // Set the ellipsoid around the camera (e.g. your player's size)
            camera.ellipsoid = new BABYLON.Vector3(0.1, 0.7, 0.1);

            // Set the speed of the camera and the minimum near clipping plane
            camera.speed = 0.1;
            camera.minZ = 0.1;
            camera.fov = 1.15; // Adjust the field of view

            // Adjust the camera's rotation to avoid looking at the floor
            //camera.rotation.x = Math.PI / 4;
        



        // Lights 
        var directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-6, 3, 0), scene);
        directionalLight.intensity = 2;
        directionalLight.direction = new BABYLON.Vector3(0.8, -0.6, 0.08);
        directionalLight.diffuse = new BABYLON.Color3(1, 1, 1); // White
        directionalLight.specular = new BABYLON.Color3(0, 0, 0);

        var hemisphericLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        hemisphericLight.intensity = 1; 
        hemisphericLight.diffuse = new BABYLON.Color3(1, 1, 1); 
        hemisphericLight.specular = new BABYLON.Color3(1, 1, 1); 
        hemisphericLight.groundColor = new BABYLON.Color3(1, 1, 1); 

        var pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(-1.6, 1, -0.36), scene);
        pointLight.intensity = 10;
        pointLight.range = 10; 
        pointLight.diffuse = new BABYLON.Color3(1, 1, 1); // White
        pointLight.specular = new BABYLON.Color3(0, 0, 0);
        

        // Create a skybox
        var skybox = BABYLON.MeshBuilder.CreateBox('skyBox', {size:1000.0}, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial('skyBox', scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("scenes/assets/misty_farm_road_2k_env.dds", scene); // replace "textures/skybox" with the path to your skybox texture
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.reflectionTexture.level = 0.8; // Reduce the intensity of the reflections
        skyboxMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true; // Make the skybox unlit
        skybox.material = skyboxMaterial; // Make the skybox always be behind all other objects
        skybox.infiniteDistance = true; // Disable collisions for the skybox
        skybox.checkCollisions = false;
        skybox.rotation.y = Math.PI/2; // Math.PI radians is 180 degrees
        
        
        // Create the room interior Reflection Probe
        var hdrTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("scenes/assets/RoomRefProbe2_env.dds", scene);
        hdrTexture.gammaSpace = false;
        hdrTexture.level = 2;
        scene.environmentTexture = hdrTexture;
        hdrTexture.boundingBoxSize = new BABYLON.Vector3(8.2, 4, 11);
        hdrTexture.boundingBoxPosition = new BABYLON.Vector3(0, 2.3, 0);


        // Load the proxy mesh
        BABYLON.SceneLoader.ImportMesh("", "scenes/assets/", "proxy.gltf", scene, function (meshes) {
            meshes.forEach(function(mesh) {
                // Enable collision on the mesh
                mesh.checkCollisions = true;
                // Make the mesh invisible
                mesh.isVisible = false;
                mesh.material = new BABYLON.StandardMaterial("proxyMaterial", scene);
            });
        });



        

        let excludedMeshesFromLightmap = ["LiquidObject","Light Blocker","CurveObject","final_room_primitive4","dragonLR"];

        // Load the Room meshes
        BABYLON.SceneLoader.ImportMesh("", "scenes/assets/", "room_objects.gltf", scene, function (meshes) {   
            
            meshes.forEach(function (mesh) {

            if (mesh.name === 'LiquidObject') {
                var liquidMat = scene.getMaterialByName("Liquid_Object");
                    liquidMat.albedoColor = new BABYLON.Color3(0, .025, 0.06); 
                    liquidMat.alpha = 0.0; // Transparency
                    liquidMat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND; // Enable alpha blending
                    liquidMat.roughness = 0; // Roughness
                    liquidMat.metallic = 0.18; // Metallic
                    liquidMat.indexOfRefraction = 2.1; // Index of refraction
                    liquidMat.metallicF0Factor = 0.8;
                    liquidMat.microSurface = 0.6; // F0 factor (also known as the microSurface property in Babylon.js)
                    liquidMat.metallicReflectanceColor = new BABYLON.Color3(1, 0, 0); // Metallic reflectance color to red
                    
                    var liquidthicknessTexture = new BABYLON.Texture("scenes/assets/liquid_thickness.png", scene);
                    liquidthicknessTexture.vScale = -1;
                    liquidMat.subSurface.thicknessTexture = liquidthicknessTexture;
                    liquidMat.subSurface.minimumThickness = 0.5;
                    liquidMat.subSurface.maximumThickness = 7.4;
                    liquidMat.subSurface.isRefractionEnabled = true;
                    liquidMat.subSurface.isTranslucencyEnabled = true;
                    liquidMat.subSurface.linkRefractionWithTransparency = true;
        
                    liquidMat.subSurface.refractionIntensity = 0.54;
                    liquidMat.subSurface.indexOfRefraction = 1.89;
        
                    liquidMat.subSurface.tintColor = BABYLON.Color3.FromHexString("#75E9CA").toLinearSpace();
                    liquidMat.subSurface.tintColorAtDistance = 1.2;
                    liquidMat.subSurface.translucencyIntensity = 0.78;
                    liquidMat.subSurface.diffusionDistance = BABYLON.Color3.FromHexString("#F3F3F3").toLinearSpace();
                    liquidMat.subSurface.useAlbedoToTintRefraction = false;
                    liquidMat.subSurface.useAlbedoToTranslucency = true;
                    liquidMat.subSurface.useAlbedoToScatterTransmission = true;  

                    mesh.material = liquidMat;
                }
              

                if (mesh.name === 'dragonLR') {

                console.log('dragonLR', mesh);
                console.log('DragonGlass', dMat);
                var dMat = scene.getMaterialByName("DragonGlass");
                    dMat.metallic = 0.08;
                    dMat.roughness = 0.42;
                    dMat.alpha = 0.0;
                    dMat.indexOfRefraction = 1.37;
                    dMat.metallicF0Factor= 1;
                    dMat.albedoColor = BABYLON.Color3.FromHexString("#688169").toLinearSpace();
            
                    //subsurface
                    var thicknessTexture = new BABYLON.Texture("scenes/assets/thicknessMap.png", scene, false, false);
                    dMat.subSurface.thicknessTexture = thicknessTexture;

                    dMat.subSurface.minimumThickness = 0.9;
                    dMat.subSurface.maximumThickness = 6;

                    dMat.subSurface.isRefractionEnabled = true;
                    dMat.subSurface.linkRefractionWithTransparency = true;
            
                    dMat.subSurface.refractionIntensity = 0.57;
                    dMat.subSurface.indexOfRefraction = 1.26;
            
                    dMat.subSurface.tintColor = BABYLON.Color3.FromHexString("#B1EDED").toLinearSpace();
                    dMat.subSurface.tintColorAtDistance = 2.7;
                    // dMat.subSurface.isTranslucencyEnabled = false;
                    dMat.subSurface.translucencyIntensity = 0.78;
                    // dMat.subSurface.diffusionDistance = BABYLON.Color3.FromHexString("#F3F3F3").toLinearSpace();
            
                    mesh.material = dMat;
                }

                if (mesh.name === 'Light Blocker') {
                    mesh.isVisible = false;
                }

                if (mesh.name === 'CurvedObject') {
                    var curveMat = scene.getMaterialByName("CurveObject");
                    curveMat.albedoColor = BABYLON.Color3.FromHexString("#3AA5BF").toLinearSpace();
                    curveMat.alpha = 0.0;
                    curveMat.metallic = 0.18;
                    curveMat.roughness = 0.42;
                    curveMat.indexOfRefraction = 1.37;
                    curveMat.metallicF0Factor= 1;
                    curveMat.subSurface.tintColor = BABYLON.Color3.FromHexString("#B1EDED").toLinearSpace();
                    curveMat.subSurface.refractionIntensity = 1;
                    curveMat.subSurface.indexOfRefraction = 1.61;
        
                }
           
            if (excludedMeshesFromLightmap.includes(mesh.name)) {
                return; // Skip these meshes from Lightmap
            }
            if (mesh.material) {
                var lightmapTexture = new BABYLON.Texture("scenes/assets/lightmap.png", scene);
                mesh.material.lightmapTexture = lightmapTexture;
                mesh.material.lightmapTexture.isRGBD = true;
                mesh.material.lightmapTexture.gammaSpace = false;
                mesh.material.lightmapTexture.level = 1.0; // Increase this value to make the lightmap brighter
                mesh.material.useLightmapAsShadowmap = true;
                mesh.material.lightmapTexture.coordinatesIndex = 1;
                mesh.material.lightmapTexture.vScale = 1; // Invert the V coordinates to flip the texture vertically
                //mesh.material.reflectivityColor = new BABYLON.Color3(1, 1, 1); // Adjust this value to control the strength of the reflections
            }
            });


        var wallsMat = scene.getMaterialByName("Walls");
        if (wallsMat) {
            wallsMat.roughness = 0.9;

        }

            var floorMat = scene.getMaterialByName("Floor"); // Get the material for the floor

            if (floorMat instanceof BABYLON.StandardMaterial) {
                var pbrFloorMat = new BABYLON.PBRMaterial(floorMat.name, scene);
                pbrFloorMat.albedoTexture = floorMat.diffuseTexture;
                pbrFloorMat.bumpTexture = floorMat.bumpTexture;
                pbrFloorMat.reflectivityTexture = floorMat.specularTexture;
                pbrFloorMat.microSurface = floorMat.specularPower;
                pbrFloorMat.useMicroSurfaceFromReflectivityMapAlpha = true;
            
                // Enable BRDF
                pbrFloorMat.useEnergyConservation = true;
                pbrFloorMat.useRadianceOverAlpha = true;
                pbrFloorMat.useSpecularOverAlpha = true;
                pbrFloorMat.usePhysicalLightFalloff = true;
                pbrFloorMat.useParallax = true;
                pbrFloorMat.useParallaxOcclusion = true;
                pbrFloorMat.usePerturbedNormal = true;
            
                // Replace the standard material with the PBR material
                floorMat = pbrFloorMat;
                pbrFloorMat.microSurfaceTexture = new BABYLON.Texture("scenes/assets/roomspec.png", scene);
            }
            
            // Fireplace material
            var fireplaceMat = scene.getMaterialByName("Fireplace");
            if (fireplaceMat) {
  
            }

            // Ceiling material
            var ceilingMat = scene.getMaterialByName("Ceiling");
            if (ceilingMat) {

                ceilingMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
                ceilingMat.emissiveColor.scaleInPlace(2);
                ceilingMat.roughness = 0.9;

            }

            var glassMat = scene.getMaterialByName("Glass");
            if (glassMat) {
                glassMat.albedoColor = new BABYLON.Color3(1, 1, 1); 
                glassMat.alpha = 0.5; // Transparency
                glassMat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND; // Enable alpha blending
                glassMat.roughness = 0; // Roughness
                glassMat.metallic = 0.18; // Metallic
                glassMat.indexOfRefraction = 2.1; // Index of refraction
                glassMat.microSurface = 0.6; // F0 factor (also known as the microSurface property in Babylon.js)
                glassMat.bumpTexture.level = 0.1; // Bump level
            }
           
        

        });
       




      

            //POST PROCESSING//

            // Create a default pipeline (which includes bloom by default)
            var pipeline = new BABYLON.DefaultRenderingPipeline(
                "default", // The name of the pipeline
                true, // Do you want HDR textures ?
                scene, // The scene instance
                [scene.activeCamera] // The list of cameras to be attached to
            );

            // Enable bloom
            pipeline.bloomEnabled = true;

            // Set bloom parameters
            pipeline.bloomThreshold = 0.8;
            pipeline.bloomWeight = 0.3;
            pipeline.bloomKernel = 64;

            // // Add chromatic aberration
            // var chromaticAberration = new BABYLON.ChromaticAberrationPostProcess('chromaticAberration', new BABYLON.Vector2(1,1), null, null, 1.0, scene.activeCamera, BABYLON.Texture.BILINEAR_SAMPLINGMODE, scene.getEngine(), true);
            // chromaticAberration.aberrationAmount = 20;
            // chromaticAberration.radialIntensity = 0.42;
            // chromaticAberration.centerPosition = new BABYLON.Vector2(0.5, 0.5);
            // chromaticAberration.direction = new BABYLON.Vector2(0.71, 0.71);

            // // Add vignetting
            // var vignette = new BABYLON.VignettePostProcess('vignette', new BABYLON.Vector2(1,1), scene.activeCamera);
            // vignette.color = new BABYLON.Color4(0, 0, 0, 0);
            // vignette.cameraFov = 0.6;
            // vignette.weight = 2.1;

            // Add tone mapping
            pipeline.imageProcessing.toneMappingEnabled = true;
            pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
            pipeline.imageProcessing.exposure = 1.0;

            // Add FXAA
            pipeline.fxaaEnabled = true;

            // Set linear color space
            pipeline.imageProcessing.colorCurvesEnabled = true;
            var colorCurves = new BABYLON.ColorCurves();
            colorCurves.globalSaturation = 100;
            colorCurves.globalContrast = 100;
            pipeline.imageProcessing.colorCurves = colorCurves;

            // // Add color grading
            // pipeline.imageProcessing.colorGradingEnabled = true;
            // pipeline.imageProcessing.colorGradingTexture = new BABYLON.Texture("path/to/your/colorGradingTexture.png", scene);

            // // Add godrays
            // var godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, scene.activeCamera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, scene.getEngine(), false);
            // godrays.mesh.material.diffuseTexture = new BABYLON.Texture("path/to/your/sunTexture.png", scene);
            // godrays.mesh.material.diffuseTexture.hasAlpha = true;






        return scene;
    };

    var scene = createScene();
    // scene.debugLayer.show();

    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });
});