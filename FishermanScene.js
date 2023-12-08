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
    Texture,
} = tiny;

const { Cube, Subdivision_Sphere, Textured_Phong, Textured_Phong_Shader } =
    defs;

export class FishermanScene extends Scene {
    constructor() {
        super();

        this.shapes = {
            //fisherman
            head: new Subdivision_Sphere(3),
            body: new Cube(),
            leftArm: new Cube(),
            rightArm: new Cube(),
            leftLeg: new Cube(),
            rightLeg: new Cube(),

            //fishing rod
            handle: new Subdivision_Sphere(4),
            shaft: new Subdivision_Sphere(4),
            lure: new Subdivision_Sphere(4),
            string: new defs.Cylindrical_Tube(3, 30, [[0, 1], [0, 1]]),
        };

        const phong_shader = new Textured_Phong(1);

        this.materials = {
            body: new Material(phong_shader, {
                ambient: 0.5,
                color: hex_color("#6e6e6e"), // Dark gray
            }),
            head: new Material(phong_shader, {
                ambient: 0.5,
                color: hex_color("#f4c542"), // Yellowish
            }),
            limb: new Material(phong_shader, {
                ambient: 0.5,
                color: hex_color("#6e6e6e"), // Dark gray
            }),

            //fishing rod
            rod: new Material(new defs.Phong_Shader(), {
                ambient: 0.7,
                diffusivity: 0.6,
                color: hex_color("#8B4513"), // Brown
            }),
            lure: new Material(new defs.Phong_Shader(), {
                ambient: 0.7,
                diffusivity: 0.6,
                color: hex_color("#FF0000"), // Red color for the lure
            }),
            string: new Material(new defs.Phong_Shader(), {
                ambient: 0.7,
                diffusivity: 0.6,
                color: hex_color("#000000"), // Black color for the string
            }),
        };

        this.initial_camera_location = Mat4.look_at(
            vec3(0, -5, 15),
            vec3(0, 0, 0),
            vec3(0, 1, 0)
        );

        this.head_transform = Mat4.identity();
        this.body_transform = Mat4.identity();
        this.left_arm_transform = Mat4.identity();
        this.right_arm_transform = Mat4.identity();
    }

    display(context, program_state) {
        program_state.lights = [
            new Light(vec4(0, 0, 10, 1), color(1, 1, 1, 1), 100),
        ];

        // Apply translation to move the entire figure up
        let model_transform = Mat4.rotation(Math.PI / 2, 1, 0, 0).times(
            Mat4.translation(0, 4, 7).times(Mat4.scale(0.3, 0.3, 0.3))
        );

        this.drawStickFigure(context, program_state, model_transform);
        this.drawFishingRod(context, program_state, model_transform);
    }

    drawFishingRod(context, program_state, model_transform) {
        // draw fishing rod
        const t = program_state.animation_time / 1000;

        //let handle_transform = Mat4.identity().times(Mat4.translation(0, 0, 8)).times(Mat4.scale(0.5, 0.5, 1.5));
        let handle_transform = this.right_arm_transform.times(Mat4.translation(0,1.3,0)).times(Mat4.scale(1,0.3,2));
        let shaft_transform = handle_transform.times(Mat4.translation(0,0,-4)).times(Mat4.scale(0.4, 0.4, 5));
        let lure_transform = shaft_transform.times(Mat4.translation(0,-7,0)).times(Mat4.scale(1,1,0.05));

        this.shapes.handle.draw(context, program_state, handle_transform, this.materials.rod);
        this.shapes.shaft.draw(context, program_state, shaft_transform, this.materials.rod);
        //lure_transform = lure_transform.times(Mat4.rotation(t * 10, 0, 0, 1)).times(Mat4.translation(0, 4, 0));
        this.shapes.lure.draw(context, program_state, lure_transform, this.materials.lure);
    }

    drawStickFigure(context, program_state, model_transform) {
        // Draw head
        this.head_transform = model_transform
            .times(Mat4.translation(0, 2.75, 0.5))
            .times(Mat4.scale(0.8, 0.8, 0.8));
        this.shapes.head.draw(
            context,
            program_state,
            this.head_transform,
            this.materials.head
        );

        // Draw body
        this.body_transform = model_transform
            .times(Mat4.translation(0, 0, 0))
            .times(Mat4.scale(1, 2, 0.5));
        this.shapes.body.draw(
            context,
            program_state,
            this.body_transform,
            this.materials.body
        );

        // Draw left arm
        this.left_arm_transform = model_transform
            .times(Mat4.translation(-1.5, 0.5, 0.5))
            .times(Mat4.rotation(-Math.PI / 8, 1, 0, 0))
            .times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.leftArm.draw(
            context,
            program_state,
            this.left_arm_transform,
            this.materials.limb
        );

        let translation_distance =
            1.5 * Math.sin(program_state.animation_time / 1000);

        // Draw right arm with both rotation and translation
        // Draw right arm with both rotation and translation
        // Draw right arm with both rotation and translation
        let right_arm_rotation_angle =
            1 * Math.sin(program_state.animation_time / 1000); // Adjusted rotation range
        let right_arm_pivot_translation = Mat4.translation(
            -0.5, // X-coordinate to move the pivot point to the left end
            -0.5, // Y-coordinate (no vertical movement)
            0 // Z-coordinate (no depth movement)
        );
        this.right_arm_transform = model_transform
            .times(Mat4.translation(2, 3.25, 0.25)) // Translate back to the original position
            .times(right_arm_pivot_translation) // Move the pivot point
            .times(Mat4.rotation(right_arm_rotation_angle, 1, 0, 0)) // Rotate around the pivot
            .times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.rightArm.draw(
            context,
            program_state,
            this.right_arm_transform,
            this.materials.limb
        );

        // Draw left leg
        let left_leg_transform = model_transform
            .times(Mat4.translation(-0.75, -3, 0))
            .times(Mat4.rotation(Math.PI / 16, 1, 0, 0))
            .times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.leftLeg.draw(
            context,
            program_state,
            left_leg_transform,
            this.materials.limb
        );

        // Draw right leg
        let right_leg_transform = model_transform
            .times(Mat4.translation(0.75, -3, 0))
            .times(Mat4.rotation(Math.PI / 16, 1, 0, 0))
            .times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.rightLeg.draw(
            context,
            program_state,
            right_leg_transform,
            this.materials.limb
        );
    }
}
