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

      fish: new Material(new defs.Phong_Shader(), {
        ambient: 0.7,
        diffusivity: 0.6,
        color: hex_color("800080"),
      }),
      fish2: new Material(new defs.Phong_Shader(), {
        ambient: 0.7,
        diffusivity: 0.6,
        color: hex_color("#FFA500"),
      }),
      fish3: new Material(new defs.Phong_Shader(), {
        ambient: 0.7,
        diffusivity: 0.6,
        color: hex_color("#00FF00"),
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

        texture: new Texture(
          "assets/ocean.png",
          "LINEAR_MIPMAP_LINEAR"
        ),
      }),
    };

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
  }

  make_control_panel() {
    // TODO: Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
    this.key_triggered_button(
      "Pause/Start Animation",
      ["Control", "0"],
      () => {
        this.isAnimation = !this.isAnimation;
        this.hasPositioned = false;
      }
    );

    this.key_triggered_button("Switch POV", ["Control", "1"], () => {
      this.isAerial = !this.isAerial;
      this.hasPositioned = false;
    });
    this.key_triggered_button("Debug", ["Control", "2"], () => {
      console.log(this.initial_camera_location);
      //this.isAnimation = false;
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
    program_state.lights = [
      new Light(light_position, color(1, 1, 1, 1), 1000),
    ];

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

        // Calculate the normalized time within the animation duration
        let normalizedTime =
          (t % animationDuration) / animationDuration;

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
        let normalizedTime =
          (t % animationDuration) / animationDuration;

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

    let fish_transform = model_transform
      .times(Mat4.translation(10, 0, -20))
      .times(Mat4.scale(2, 2, 2))
      .times(Mat4.rotation(t * 4, Math.PI, 1, 0, 0))
      .times(Mat4.translation(7, 0, 5));

    this.shapes.fish.draw(
      context,
      program_state,
      fish_transform,
      this.materials.fish
    );

    let fish_transform2 = model_transform
      .times(Mat4.translation(100, 0, -120))
      .times(Mat4.scale(2, 2, 2))
      .times(Mat4.rotation(t2 * 4, Math.PI, 1, 0, 0))
      .times(Mat4.translation(7, 0, 5));

    this.shapes.fish.draw(
      context,
      program_state,
      fish_transform2,
      this.materials.fish2
    );

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
    let background_transform = model_transform.times(
      Mat4.scale(200, 200, 200)
    );

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
    let tree_transform = model_transform
      .times(Mat4.translation(5, 5, 10)) // Set the position of the tree
      .times(Mat4.scale(2, 2, 2)) // Set the scale of the tree
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)); // Rotate around the y-axis

    this.shapes.tree.draw(
      context,
      program_state,
      tree_transform,
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
