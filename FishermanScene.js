import { defs, tiny } from "./examples/common.js";

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
} = tiny;

const { Cube, Subdivision_Sphere, Textured_Phong, Textured_Phong_Shader } =
    defs;

export class FishermanScene extends Scene {
    constructor() {
        super();

        this.shapes = {
            head: new Subdivision_Sphere(3),
            torso: new Cube(),
            leftArm: new Cube(),
            rightArm: new Cube(),
            legs: new Cube(),
            leftFoot: new Cube(),
            rightFoot: new Cube(),
        };

        const phong_shader = new Textured_Phong(1);

        this.materials = {
            torso: new Material(new defs.Phong_Shader(), {
                ambient: 0.8,
                color: hex_color("#A3C4EB"), // Dark gray
            }),
            legs: new Material(new defs.Phong_Shader(), {
              ambient: 0.8,
              color: hex_color("#FFFFFF"), // Dark gray
            }),
            head: new Material(new defs.Phong_Shader(), {
                ambient: 0.8,
                color: hex_color("#FFDBAC"), // Yellowish
            }),
            limb: new Material(new defs.Phong_Shader(), {
                ambient: 0.8,
                color: hex_color("#FFDBAC"), // Light brown
            }),
        };

        this.initial_camera_location = Mat4.look_at(
            vec3(0, -5, 15),
            vec3(0, 0, 0),
            vec3(0, 1, 0)
        );
    }

    display(context, program_state) {
        program_state.lights = [
            new Light(vec4(0, 0, 10, 1), color(1, 1, 1, 1), 100),
        ];

        // Apply translation to move the entire figure up
        let model_transform = Mat4.rotation(Math.PI / 2, 1, 0, 0).times(
            Mat4.translation(0, 6, 7).times(Mat4.scale(.6, 0.6, 0.6))
        );

        this.drawStickFigure(context, program_state, model_transform);
    }

    drawStickFigure(context, program_state, model_transform) {
        // Draw head
        let head_transform = model_transform
            .times(Mat4.translation(0, 3, 0.5))
            .times(Mat4.scale(0.8, 0.8, 0.8));
        this.shapes.head.draw(
            context,
            program_state,
            head_transform,
            this.materials.head
        );

        // Draw body
        let body_transform = model_transform
            .times(Mat4.translation(0, 1.2, 0))
            .times(Mat4.scale(1, 1.2, 0.5));
        this.shapes.torso.draw(
            context,
            program_state,
            body_transform,
            this.materials.torso
        );

        // Draw left_leg
        let left_leg_transform = model_transform
          .times(Mat4.translation(0.7, -1, 0))
          .times(Mat4.scale(0.5, 1, 0.5));
        this.shapes.legs.draw(
          context,
          program_state,
          left_leg_transform,
          this.materials.legs
        );

      // Draw right_leg
      let right_leg_transform = model_transform
        .times(Mat4.translation(-.7, -1, 0))
        .times(Mat4.scale(0.5, 1, 0.5));
      this.shapes.legs.draw(
        context,
        program_state,
        right_leg_transform,
        this.materials.legs
      );

        // Draw left arm
        let left_arm_transform = model_transform
            .times(Mat4.translation(-1.5, 1, 0.5))
            .times(Mat4.rotation(-Math.PI / 8, 1, 0, 0))
            .times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.leftArm.draw(
            context,
            program_state,
            left_arm_transform,
            this.materials.limb
        );

        // Draw right arm
        let right_arm_transform = model_transform
            .times(Mat4.translation(1.5, 1, 0.5))
            .times(Mat4.rotation(-Math.PI / 8, 1, 0, 0))
            .times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.rightArm.draw(
            context,
            program_state,
            right_arm_transform,
            this.materials.limb
        );

        // Draw left foot
        let left_foot_transform = model_transform
            .times(Mat4.translation(-0.75, -3, 0))
            .times(Mat4.rotation(Math.PI / 16, 1, 0, 0))
            .times(Mat4.scale(0.5, 1, 0.5));
        this.shapes.leftFoot.draw(
            context,
            program_state,
          left_foot_transform,
            this.materials.limb
        );

        // Draw right foot
        let right_foot_transform = model_transform
            .times(Mat4.translation(0.75, -3, 0))
            .times(Mat4.rotation(Math.PI / 16, 1, 0, 0))
            .times(Mat4.scale(0.5, 1, 0.5));
        this.shapes.rightFoot.draw(
            context,
            program_state,
          right_foot_transform,
            this.materials.limb
        );
    }
}
