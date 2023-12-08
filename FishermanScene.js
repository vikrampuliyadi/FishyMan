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
// let isSwinging = true;
export class FishermanScene extends Scene {
    constructor() {
        super();

        this.isSwinging = true;
        this.swingingStartPosition = null;
        this.lastTranslationDistanceX = 0;
        this.lastTranslationDistanceY = 0;
        this.lastTranslationDistanceZ = 0;
        this.lastRotationAngle = 0;

        this.shapes = {
            //fisherman
            head: new Subdivision_Sphere(3),
            torso: new Cube(),
            leftArm: new Cube(),
            rightArm: new Cube(),
            legs: new Cube(),
            leftFoot: new Cube(),
            rightFoot: new Cube(),

            //fishing rod
            handle: new Subdivision_Sphere(4),
            shaft: new Subdivision_Sphere(4),
            lure: new Subdivision_Sphere(4),
            string: new defs.Cylindrical_Tube(3, 30, [
                [0, 1],
                [0, 1],
            ]),
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

        this.lure_throw_start_time = 0;

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

    toggleSwingingMotion() {
        this.isSwinging = !this.isSwinging;

        if (!this.isSwinging) {
            this.swingingStartPosition = null;
        }
    }

    display(context, program_state) {
        program_state.lights = [
            new Light(vec4(0, 0, 10, 1), color(1, 1, 1, 1), 100),
        ];

        if (this.isSwinging) {
            // Update the swinging motion
            this.right_arm_transform = this.updateSwingingMotion(program_state);
        }

        // Apply translation to move the entire figure up
        let model_transform = Mat4.rotation(Math.PI / 2, 1, 0, 0).times(
            Mat4.translation(0, 6, 7).times(Mat4.scale(0.6, 0.6, 0.6))
        );

        this.drawStickFigure(context, program_state, model_transform);
        this.drawFishingRod(context, program_state, model_transform);
    }
    updateSwingingMotion(program_state) {
        let right_arm_rotation_angle = 0;
        let right_arm_pivot_translation = Mat4.identity();

        if (this.isSwinging) {
            // Initialize the swinging position if not set
            if (this.swingingStartPosition === null) {
                this.swingingStartPosition = program_state.animation_time;
            }

            // Calculate the rotation angle based on the time elapsed since the swinging started
            right_arm_rotation_angle =
                1 *
                Math.sin(
                    (program_state.animation_time -
                        this.swingingStartPosition) /
                        1000
                );

            // Update the last rotation angle
            this.lastRotationAngle = right_arm_rotation_angle;

            // Update the right arm pivot translation based on your requirements
            let translation_distance_x =
                1.5 * Math.sin(program_state.animation_time / 1000);
            let translation_distance_y = 0; // Adjust as needed
            let translation_distance_z = translation_distance_x;

            right_arm_pivot_translation = Mat4.translation(
                -0.5 * translation_distance_x, // X-coordinate to move the pivot point to the left end
                -translation_distance_y / 10, // Y-coordinate (no vertical movement)
                translation_distance_z // Z-coordinate
            );
        } else {
            // If not swinging, use the last rotation angle and the stored pivot translation
            right_arm_rotation_angle = this.lastRotationAngle;

            if (this.swingingStartPosition !== null) {
                let elapsed_time =
                    program_state.animation_time - this.swingingStartPosition;

                // Calculate the translation distances based on the elapsed time since toggling off
                let translation_distance_x =
                    this.lastTranslationDistanceX ||
                    1.5 * Math.sin(elapsed_time / 1000);
                let translation_distance_y = 0; // Adjust as needed
                let translation_distance_z = translation_distance_x;

                // Update the right arm pivot translation
                right_arm_pivot_translation = Mat4.translation(
                    -0.5 * translation_distance_x, // X-coordinate to move the pivot point to the left end
                    -translation_distance_y / 10, // Y-coordinate (no vertical movement)
                    translation_distance_z // Z-coordinate
                );

                // Store the last translation distances
                this.lastTranslationDistanceX = translation_distance_x;
                this.lastTranslationDistanceY = translation_distance_y;
                this.lastTranslationDistanceZ = translation_distance_z;

                // Reset the swinging position when toggling off
                // if (elapsed_time > 1000) {
                //     this.swingingStartPosition = null;
                //     this.lastTranslationDistanceX = null; // Reset the last translation distances
                //     this.lastTranslationDistanceY = null;
                //     this.lastTranslationDistanceZ = null;
                // }
            }
        }

        // Update the right arm transformation
        let right_arm_transform = Mat4.translation(2, 3, 0)
            .times(right_arm_pivot_translation)
            .times(Mat4.rotation(right_arm_rotation_angle, 1, 0, 0))
            .times(Mat4.scale(0.5, 1.5, 0.5));

        return right_arm_transform;
    }

    drawFishingRod(context, program_state, model_transform) {
        // draw fishing rod
        const t = program_state.animation_time / 1000;

        //let handle_transform = Mat4.identity().times(Mat4.translation(0, 0, 8)).times(Mat4.scale(0.5, 0.5, 1.5));
        let handle_transform = this.right_arm_transform
            .times(Mat4.translation(0, 1.2, 0))
            .times(Mat4.scale(1, 0.2, 1.5));
        let shaft_transform = handle_transform
            .times(Mat4.translation(0, 0, -4))
            .times(Mat4.scale(0.4, 0.4, 5));
        let lure_transform = shaft_transform
            .times(Mat4.translation(2, -2, -1))
            .times(Mat4.scale(1, 1, 0.05));

        this.shapes.handle.draw(
            context,
            program_state,
            handle_transform,
            this.materials.rod
        );
        this.shapes.shaft.draw(
            context,
            program_state,
            shaft_transform,
            this.materials.rod
        );
        //lure_transform = lure_transform.times(Mat4.rotation(t * 10, 0, 0, 1)).times(Mat4.translation(0, 4, 0));
        this.shapes.lure.draw(
            context,
            program_state,
            lure_transform,
            this.materials.lure
        );
    }

    drawStickFigure(context, program_state, model_transform) {
        // Draw head
        this.head_transform = model_transform
            .times(Mat4.translation(0, 3, 0.5))
            .times(Mat4.scale(0.8, 0.8, 0.8));
        this.shapes.head.draw(
            context,
            program_state,
            this.head_transform,
            this.materials.head
        );

        // Draw body
        this.body_transform = model_transform
            .times(Mat4.translation(0, 1.2, 0))
            .times(Mat4.scale(1, 1.2, 0.5));
        this.shapes.torso.draw(
            context,
            program_state,
            this.body_transform,
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
            .times(Mat4.translation(-0.7, -1, 0))
            .times(Mat4.scale(0.5, 1, 0.5));
        this.shapes.legs.draw(
            context,
            program_state,
            right_leg_transform,
            this.materials.legs
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
        let right_arm_rotation_angle = this.isSwinging
            ? 1 * Math.sin(program_state.animation_time / 1000)
            : this.lastRotationAngle; // Adjusted rotation range
        let right_arm_pivot_translation = this.isSwinging
            ? Mat4.translation(
                  -0.5, // X-coordinate to move the pivot point to the left end
                  -translation_distance / 10, // Y-coordinate (no vertical movement)
                  translation_distance // Z-coordinate (no depth movement)
              )
            : Mat4.translation(
                  -0.5 * this.lastTranslationDistanceX, // X-coordinate to move the pivot point to the left end
                  this.lastTranslationDistanceY / 10, // Y-coordinate (no vertical movement)
                  this.lastTranslationDistanceZ // Z-coordinate (no depth movement)
              ); // No translation if not swinging
        this.right_arm_transform = model_transform
            .times(Mat4.translation(2, 3, 0)) // Translate back to the original position
            .times(right_arm_pivot_translation) // Move the pivot point
            .times(Mat4.rotation(right_arm_rotation_angle, 1, 0, 0)) // Rotate around the pivot
            .times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.rightArm.draw(
            context,
            program_state,
            this.right_arm_transform,
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
