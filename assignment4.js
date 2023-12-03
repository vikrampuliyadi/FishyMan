import { defs, tiny } from "./examples/common.js";
import { Shape_From_File } from "./examples/obj-file-demo.js";

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

export class Assignment4 extends Scene {
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

    const textured = new Textured_Phong(1);

    this.materials = {
      water: new Material(textured, {
        ambient: 0.8,
        texture: new Texture("assets/water.jpeg"),
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
      tree: new Material( textured, {
        ambient: 0.7,
        diffusivity: 0.6,
        texture: new Texture("assets/palm1_uv_m2.bmp")
      }),
    };

    this.light_view_target = vec4(0, 0, 0, 1);

    // Change the initial camera location to face left, down, and north
    this.initial_camera_location = Mat4.look_at(
      vec3(30, 30, 20),   // eye position
      vec3(0, 2, 10),      // at position (where the camera is looking)
      vec3(0, 0, 1)      // up vector (defines the "up" direction in your scene)
    );

  }

  make_control_panel() {
    // TODO: Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
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

    let ocean_transform = model_transform
      .times(Mat4.translation(0, 0, 2))
      .times(Mat4.scale(300, 300, 1));

    this.shapes.sphere.draw(
      context,
      program_state,
      ocean_transform,
      this.materials.water
    );

    // Draw sand sphere
    let sand_transform = model_transform
      .times(Mat4.translation(2, 2, 2))
      .times(Mat4.scale(10, 10, 3));

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
  }
}
