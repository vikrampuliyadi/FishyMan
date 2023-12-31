import { defs, tiny } from "./examples/common.js";
import { Shape_From_File } from "./examples/obj-file-demo.js";
import { FishermanScene } from "./FishermanScene.js";

const {
  Vector,
  vec3,
  vec4,
  color,
  hex_color,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
  Texture,
} = tiny;

const {
  Cube,
  Axis_Arrows,
  Textured_Phong,
  Subdivision_Sphere,
  Textured_Phong_Shader,
} = defs;

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomColor() {
  return color(Math.random(), Math.random(), Math.random(), 1.0);
}

function angleBetweenVectors(v, w) {
  const dotProduct = v.dot(w);
  const magnitude1 = v.norm();
  const magnitude2 = w.norm();
  const cosineTheta = dotProduct / (magnitude1 * magnitude2);
  const angleInRadians = Math.acos(cosineTheta);
  return angleInRadians;
}

export class FishyMan extends Scene {
  constructor() {
    super();

    this.shapes = {
      box_1: new Cube(),
      box_2: new Cube(),
      axis: new Axis_Arrows(),
      sphere: new Subdivision_Sphere(4),
      sand: new defs.Capped_Cylinder(50, 50, [
        [0, 2],
        [0, 1],
      ]),
      fish: new Shape_From_File("assets/fish.obj"),
      tree: new Shape_From_File("assets/palm.obj"),
    };

    this.fisherman = new FishermanScene();

    const textured = new Textured_Phong(1);

    this.materials = {
      water: new Material(textured, {
        smoothness: 64,
        ambient: 0.8,
        texture: new Texture("assets/ocean.png"),
      }),
      sand: new Material(textured, {
        ambient: 0.6,
        diffusivity: 0.9,
        color: hex_color("#ffaf40"),
        smoothness: 64,
        texture: new Texture("assets/sand3.png"),
        light_depth_texture: null,
      }),
      sky: new Material(textured, {
        ambient: 0.9,
        diffusivity: 1,
        color: hex_color("#87CEEB"),
        texture: new Texture("assets/sky_three.jpeg"),
      }),
      wood: new Material(textured, {
        ambient: 0.9,
        diffusivity: 0.9,
        texture: new Texture("assets/wood2.jpg"),
      }),
      fish3: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        color: hex_color("#FF0000"),
      }),
      fish4: new Material(new defs.Phong_Shader(), {
        ambient: 0.7,
        diffusivity: 0.6,
        color: hex_color("#FF0000"),
      }),

      tree: new Material(textured, {
        ambient: 0.7,
        diffusivity: 0.6,
        texture: new Texture("assets/palm1_uv_m2.bmp"),
      }),
      ocean_rotate: new Material(new Texture_Scroll_X(), {
        color: hex_color("#000000"),
        ambient: 1.0,

        texture: new Texture("assets/ocean.png", "LINEAR_MIPMAP_LINEAR"),
      }),
    };
    // I dont think we need this w/ current implementation but ima leave this here jst in case
    // let x,
    //   y,
    //   z,
    //   s,
    //   t = 0; // Add "let" before x, y, z, s
    // this.fish = [];
    // // console.log("JELLO");

    // const gridCenter = vec3(-15, -15, 3);
    // const gridWidth = 20;
    // const gridHeight = 20;

    // for (let i = 0; i < gridWidth; i++) {
    //   for (let j = 0; j < gridHeight; j++) {
    //     x = gridCenter[0] + i * 3; // Adjust the scale as needed
    //     y = gridCenter[1] + j * 3; // Adjust the scale as needed
    //     z = gridCenter[2];

    //     // Populate the fish array with vector positions
    //     console.log(x, y, z);
    //     this.fish.push(vec3(x, y, z));
    //   }
    // }

    this.light_view_target = vec4(0, 0, 0, 1);

    // Change the initial camera location to face left, down, and north
    this.initial_camera_location = Mat4.look_at(
      vec3(30, -20, 10), // eye position
      vec3(0, 2, 10), // at position (where the camera is looking)
      vec3(0, 0, 1) // up vector (defines the "up" direction in your scene)
    );

    this.ocean_transform = Mat4.identity()
      //.times(Mat4.rotation(1, 1, 1, 0))
      //.times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.translation(0, 0, 2))
      .times(Mat4.scale(300, 300, 1));

    this.isAnimation = true;
    this.isAerial = true;
    this.hasPositioned = false;

    console.log(this.initial_camera_location);
    this.slider_value = 6;
    this.caught_fish_nums = [];
    this.isFishing = true;
    this.fish_positions = [];
    this.fish_transforms = [];
    this.color_array = [];
    this.deltas = []; // [x, y, next_t]
    // spawn fish
    for (let i = 0; i <= 100; i++) {
      let randomX = getRandomNumber(-30, 30);
      while (randomX <= 5 && randomX >= -5) {
        randomX = getRandomNumber(-30, 30);
      }
      let randomY = getRandomNumber(-30, 30);
      while (randomY <= 5 && randomY >= -5) {
        randomY = getRandomNumber(-30, 30);
      }

      this.deltas.push([0, 0, 0]);

      this.color_array.push(getRandomColor());
      this.fish_positions.push(vec3(randomX, randomY, 2.7));
      this.fish_transforms.push(
        Mat4.identity()
          .times(Mat4.translation(randomX, randomY, 2.7))
          .times(
            Mat4.scale(
              Math.random() + 0.8,
              Math.random() + 0.8,
              Math.random() + 0.8
            )
          )
      );
    }
  }

  make_control_panel() {
    // TODO: Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
    this.key_triggered_button("Pause/Start Animation", ["Control", "0"], () => {
      this.isAnimation = !this.isAnimation;
      this.hasPositioned = false;
    });
    this.key_triggered_button("Go Fish!", ["t"], () => {
      // this.fisherman.launchLure(8, Math.PI / 4);
      this.fisherman.launchLure(this.slider_value, Math.PI / 4);
    });

    this.key_triggered_button("Return to Swinging", ["e"], () => {
      this.fisherman.returnToSwinging();
    });

    this.key_triggered_button("Switch POV", ["Control", "1"], () => {
      this.isAerial = !this.isAerial;
      this.hasPositioned = false;
    });
    this.key_triggered_button("Debug", ["Control", "2"], () => {
      console.log(this.initial_camera_location);
      //this.isAnimation = false;
    });
    this.key_triggered_button("Set Desired Distance", ["Control", "3"], () => {
      const desiredDistance = this.slider_value; // Use the value from the slider
      this.fisherman.launchLure(desiredDistance, Math.PI / 4);
    });
    this.key_triggered_button("Increase Desired Distance", ["+"], () => {
      this.slider_value = this.slider_value + 0.5; // Use the value from the slider
    });
    this.key_triggered_button("Decrease Desired Distance", ["-"], () => {
      this.slider_value = this.slider_value - 0.5; // Use the value from the slider
    });
  }

  display(context, program_state) {
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      program_state.set_camera(this.initial_camera_location);
      //facing east down north
    }

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      1,
      1000
    );

    const light_position = vec4(-3, -18, -90, 0);
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

    let t = program_state.animation_time / 1500,
      dt = program_state.animation_delta_time / 1500;
    let t2 = program_state.animation_time / 1500 + 0.5,
      dt2 = program_state.animation_delta_time / 1500;
    let t3 = program_state.animation_time / 1500 + 0.8;
    let model_transform = Mat4.identity();

    if (this.isAnimation) {
      if (this.isAerial) {
        //Make viewing matrix rotate so that it rotates around the island
        const animationDuration = 30.0; // Adjust this duration as needed

        //Collision Detection?
        // var sub_x = this.player_matrix[0][3];
        // var sub_y = this.player_matrix[1][3];
        // var sub_z = this.player_matrix[2][3];

        // Collision Detection?
        // var sub_x = 0;
        // var sub_y = 0;
        // var sub_z = -40;

        // for (let b = 0; b < this.fish.length; b++) {
        //   let fish_position = this.fish[b];
        //   let fish_x = fish_position[0];
        //   let fish_y = fish_position[1];
        //   let fish_z = fish_position[2];
        //   // console.log(fish_x, fish_y, fish_z);

        //   // Collision between fish and wildlife
        //   // console.log(
        //   //   Math.abs(sub_x - fish_x),
        //   //   Math.abs(sub_y - fish_y),
        //   //   Math.abs(sub_z - fish_z)
        //   // );
        //   // if (
        //   //   Math.abs(sub_x - fish_x) <= 10 &&
        //   //   Math.abs(sub_y - fish_y) <= 10 &&
        //   //   Math.abs(0 - 0) <= 10
        //   // ) {
        //   if (Math.abs(0) <= 10 && Math.abs(0) <= 10 && Math.abs(0 - 0) <= 10) {
        //     // console.log("Collision detected. Creating a new fish.");
        //     // If collision, create a new fish at the same position
        //     let new_fish_position = vec3(fish_x, fish_y, fish_z); // You might want to generate new coordinates here

        //     let collision_fish_transform = model_transform
        //       // .times(Mat4.translation(new_fish_position)
        //       .times(Mat4.translation(fish_x, fish_y, fish_z))
        //       .times(Mat4.translation(1, -60, 1));

        //     this.shapes.fish.draw(
        //       context,
        //       program_state,
        //       collision_fish_transform,
        //       this.materials.fish3
        //     );
        //     this.fish[b] = new_fish_position;
        //   }
        // }

        // Draw water background
        let background_transform = model_transform.times(
          Mat4.scale(200, 200, 200)
        );

        let normalizedTime = (t % animationDuration) / animationDuration;
        // Use the normalized time to create an oscillating movement
        let angle = normalizedTime * 2 * Math.PI;

        // Update the camera position based on the sine function
        let eye_position = vec3(
          30 * Math.cos(angle),
          -20 * Math.sin(angle),
          10
        );
        let at_position = vec3(0, 2, 10);
        let up_vector = vec3(0, 0, 1);

        // Update the initial camera location matrix
        this.initial_camera_location = Mat4.look_at(
          eye_position,
          at_position,
          up_vector
        );
        program_state.set_camera(this.initial_camera_location);
      } else {
        //FisherMan POV looking left and right wiggling
        const animationDuration = 30.0; // Adjust this duration as needed

        // Calculate the normalized time within the animation duration
        let normalizedTime = (t % animationDuration) / animationDuration;

        // Use the normalized time to create a limited oscillating movement (45 degrees left to right)
        let maxAngle = Math.PI / 4; // 45 degrees
        let angle = normalizedTime * maxAngle * 2; // Make one full cycle within the animation duration

        // Update the camera position based on the sine function
        let eye_position = vec3(
          5 + 5 * Math.cos(angle), // Adjust the initial x-coordinate and amplitude as needed
          10.9, // Keep the initial y-coordinate constant for no vertical motion
          6
        );
        let at_position = vec3(-3, -5, 10); // Adjust the "at" position as needed
        let up_vector = vec3(0, 0, 1);

        // Update the initial camera location matrix
        this.initial_camera_location = Mat4.look_at(
          eye_position,
          at_position,
          up_vector
        );
        program_state.set_camera(this.initial_camera_location);
      }
    } else {
      //No movement
      if (!this.hasPositioned) {
        if (this.isAerial) {
          //Original Camera locatoin
          this.initial_camera_location = Mat4.look_at(
            vec3(30, -20, 10), // eye position
            vec3(0, 2, 10), // at position (where the camera is looking)
            vec3(0, 0, 1) // up vector (defines the "up" direction in your scene)
          );
          program_state.set_camera(this.initial_camera_location);
        } else {
          //Fisherman POV but not wiggling

          this.initial_camera_location = Mat4.look_at(
            vec3(5, 10.9, 6), // eye position
            vec3(-3, -5, 10), // at position (where the camera is looking)
            vec3(0, 0, 1) // up vector (defines the "up" direction in your scene))
          );
          program_state.set_camera(this.initial_camera_location);
        }
        this.hasPositioned = true;
      } else {
        //do nothing since if it has been positioned alr, we let
        //users do freely with camera
      }
    }

    if (this.caught_fish_nums.length > 0) {
      for (let i = 0; i < this.caught_fish_nums.length; i++) {
        let caught_fish_transform = Mat4.identity().times(
          Mat4.translation(0, 0, i + 5)
        );
        this.shapes.fish.draw(
          context,
          program_state,
          caught_fish_transform,
          this.materials.fish3.override({
            color: this.color_array[i],
          })
        );
      }
    }

    let lure_position = this.fisherman.getLurePosition();
    for (let i = 0; i <= 100; i++) {
      if (i == this.caught_fish_num) {
        let caught_fish_transform = Mat4.identity().times(
          Mat4.translation(lure_position[0], lure_position[1], 10)
        );
        this.shapes.fish.draw(
          context,
          program_state,
          caught_fish_transform,
          this.materials.fish3.override({
            color: this.color_array[i],
          })
        );
        this.caught_fish_num = -1;
        continue;
      }
      if (this.caught_fish_nums.includes(i)) {
        continue;
      }
      //store old t, change dir at new t generated
      if (Math.floor(t) == Math.floor(this.deltas[i][2])) {
        this.deltas[i][0] = getRandomNumber(-1, 1);
        this.deltas[i][1] = getRandomNumber(-1, 1);
        this.deltas[i][2] = t + getRandomNumber(3, 5);
      }
      let new_x = this.fish_positions[i][0] + this.deltas[i][0] * dt * 4;
      let new_y = this.fish_positions[i][1] + this.deltas[i][1] * dt * 4;
      this.fish_positions[i][0] = new_x;
      this.fish_positions[i][1] = new_y;
      // Update the translation part of the fish transformation
      this.fish_transforms[i] = Mat4.identity()
        .times(Mat4.translation(new_x, new_y, 2.7))
        .times(
          Mat4.rotation(
            angleBetweenVectors(
              vec3(1, 0, 0),
              vec3(this.deltas[i][0], this.deltas[i][1], 0)
            ),
            0,
            0,
            1
          )
        );

      this.shapes.fish.draw(
        context,
        program_state,
        this.fish_transforms[i],
        this.materials.fish3.override({
          color: this.color_array[i],
        })
      );
    }

    // collision detection
    if (lure_position[2] <= 3.3) {
      for (let i = 0; i <= 100; i++) {
        if (this.caught_fish_nums.includes(i)) {
          continue;
        }
        const distance = Math.sqrt(
          (this.fish_positions[i][0] - lure_position[0]) ** 2 +
            (this.fish_positions[i][1] - lure_position[1]) ** 2 +
            (this.fish_positions[i][2] - lure_position[2]) ** 2
        );
        if (distance <= 5) {
          let curr_fish = this.fish_positions[i];
          curr_fish[0] = lure_position[0];
          curr_fish[1] = lure_position[1];
          this.caught_fish_num = i;
          this.caught_fish_nums.push(i);
          this.fisherman.setCaught(true);
          break;
        }
      }
    }

    let fish_transform3 = model_transform
      .times(Mat4.translation(30, -25, 5))
      .times(Mat4.scale(2, 2, 2))
      .times(Mat4.rotation(t2 * 4, Math.PI, 1, 0, 0))
      .times(Mat4.translation(7, 0, 5));

    this.shapes.fish.draw(
      context,
      program_state,
      fish_transform3,
      this.materials.fish3
    );

    let fish_transform4 = model_transform
      .times(Mat4.translation(27, -15, -5))
      .times(Mat4.scale(2, 2, 2))
      .times(Mat4.rotation(t3 * 4, Math.PI, 1, 0, 0))
      .times(Mat4.translation(7, 0, 5));

    this.shapes.fish.draw(
      context,
      program_state,
      fish_transform4,
      this.materials.fish4
    );

    // Draw water background
    let background_transform = model_transform.times(Mat4.scale(200, 200, 200));

    this.shapes.sphere.draw(
      context,
      program_state,
      background_transform,
      this.materials.sky
    );

    let box_1_rad = (Math.PI / 100) * dt;

    this.ocean_transform = this.ocean_transform.times(
      Mat4.rotation(box_1_rad, 1, 0, 0)
    );

    this.shapes.sphere.draw(
      context,
      program_state,
      this.ocean_transform,
      this.materials.water.override({
        ambient: 0.1 * Math.sin(1.3 * t) + 0.7,
      })
    );

    // Draw sand sphere
    let sand_transform = model_transform
      .times(Mat4.translation(2, 2, 2))
      .times(Mat4.scale(20, 20, 3));

    this.shapes.sphere.draw(
      context,
      program_state,
      sand_transform,
      this.materials.sand
    );
    let tree_transform1 = model_transform
      .times(Mat4.translation(5, 5, 10)) // Set the position of the tree
      .times(Mat4.scale(2, 2, 2)) // Set the scale of the tree
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)); // Rotate around the y-axis

    this.shapes.tree.draw(
      context,
      program_state,
      tree_transform1,
      this.materials.tree
    );
    let tree_transform2 = model_transform
      .times(Mat4.translation(10, 2, 13)) // Set the position of the tree
      .times(Mat4.scale(2, 2, 2)) // Set the scale of the tree
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)); // Rotate around the y-axis

    this.shapes.tree.draw(
      context,
      program_state,
      tree_transform2,
      this.materials.tree
    );
    let tree_transform3 = model_transform
      .times(Mat4.translation(8, 7, 12)) // Set the position of the tree
      .times(Mat4.scale(2, 2, 2)) // Set the scale of the tree
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)); // Rotate around the y-axis

    this.shapes.tree.draw(
      context,
      program_state,
      tree_transform3,
      this.materials.tree
    );
    let tree_transform4 = model_transform
      .times(Mat4.translation(3, 10, 14)) // Set the position of the tree
      .times(Mat4.scale(2, 2, 2)) // Set the scale of the tree
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)); // Rotate around the y-axis

    this.shapes.tree.draw(
      context,
      program_state,
      tree_transform4,
      this.materials.tree
    );

    this.fisherman.display(context, program_state);
  }
}

class Texture_Scroll_X extends Textured_Phong {
  // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
  fragment_glsl_code() {
    return (
      this.shared_glsl_code() +
      `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:


                float slide_translation = mod(animation_time, 4.) * 2.; 
                mat4 slide_matrix = mat4(vec4(-1., 0., 0., 0.), 
                                   vec4( 0., 1., 0., 0.), 
                                   vec4( 0., 0., 1., 0.), 
                                   vec4(slide_translation, 0., 0., 1.)); 

                vec4 new_tex_coord = vec4(f_tex_coord, 0, 0) + vec4(1., 1., 0., 1.); 
                new_tex_coord = slide_matrix * new_tex_coord; 

                vec4 tex_color = texture2D(texture, new_tex_coord.xy);

                
                      // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `
    );
  }
}
