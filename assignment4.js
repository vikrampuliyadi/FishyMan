import { defs, tiny } from './examples/common.js';

const {
  Vector, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const { Cube, Axis_Arrows, Textured_Phong, Subdivision_Sphere, Textured_Phong_Shader } = defs;

export class Assignment4 extends Scene {
  constructor() {
    super();

    this.shapes = {
      box_1: new Cube(),
      box_2: new Cube(),
      axis: new Axis_Arrows(),
      sphere: new Subdivision_Sphere(4),
      sand: new defs.Capped_Cylinder(50, 50, [[0, 2], [0, 1]]),
    };

    const textured = new Textured_Phong(1); // Use Textured_Phong shader

    this.materials = {
      water: new Material(textured, { ambient: 0.5, texture: new Texture("assets/water.jpeg") }),
      sand: new Material(textured, {
        ambient: 0.3, diffusivity: 0.9, color: hex_color("#ffaf40"), smoothness: 64,
        texture: new Texture("assets/sand3.png"),
        light_depth_texture: null,
      }),
      sky: new Material(textured, {
        ambient: 0.5,
        texture: new Texture("assets/sky_three.jpeg"),
      }),
      wood: new Material(textured,
        {ambient: 0.9, diffusivity: .9, texture: new Texture("assets/wood2.jpg")}),
    };

    this.light_view_target = vec4(0, 0, 0, 1); // Declare light_view_target

    this.initial_camera_location = Mat4.look_at(vec3(0, -20, 0), vec3(0, 0, 0), vec3(0, 0, 1));
  }

  make_control_panel() {
    // TODO: Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
  }

  display(context, program_state) {
    if (!context.scratchpad.controls) {
      this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
      program_state.set_camera(Mat4.translation(-3.13, -5.05, -25.24));
      //facing east down north
    }

    // Set the background color (light blue)
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4, context.width / context.height, 1, 100
    );

    // Set up directional light
    const light_position = vec4(0, 10, 0, 0); // Directional light from above
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

    let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
    let model_transform = Mat4.identity();

    // // Draw water background
    let background_transform = model_transform.times(Mat4.scale(70, 70, 70))

    this.shapes.sphere.draw(context, program_state, background_transform, this.materials.wood);

    let ocean_transform = model_transform.times(Mat4.rotation(1, 1, 1, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.translation(0, 0, 2))
      .times(Mat4.scale(100, 100, 1));
    //
    this.shapes.sphere.draw(context, program_state, ocean_transform, this.materials.water);

  // Draw sand sphere
    let sand_transform = model_transform.times(Mat4.rotation(1, 1, 1, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.translation(2, 2, 2))
      .times(Mat4.scale(10, 10, 3));


    this.shapes.sphere.draw(context, program_state, sand_transform, this.materials.sand);
  }
}
