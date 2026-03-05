export type ExerciseType =
  | "Squats"
  | "Pushups"
  | "Bicep Curls"
  | "Shoulder Press"
  | "Lunges"
  | "Jumping Jacks"
  | "Deadlifts"
  | "Lateral Raises"
  | "High Knees"
  | "Tricep Dips"
  | "Glute Bridges"
  | "Crunches"
  | "Wide Pushups"
  | "Diamond Pushups"
  | "Pike Pushups"
  | "Wall Pushups"
  | "Overhead Tricep Extension"
  | "Tricep Kickbacks"
  | "Hammer Curls"
  | "Front Raises"
  | "Arnold Press"
  | "Upright Rows"
  | "Bent Over Rows"
  | "Reverse Flys"
  | "Chest Flys"
  | "Sumo Squats"
  | "Bulgarian Split Squats"
  | "Side Lunges"
  | "Step Ups"
  | "Calf Raises"
  | "Donkey Kicks"
  | "Fire Hydrants"
  | "Hip Thrusts"
  | "Good Mornings"
  | "Wall Sit"
  | "Sit Ups"
  | "Leg Raises"
  | "Mountain Climbers"
  | "Bicycle Crunches"
  | "Flutter Kicks"
  | "V-Ups"
  | "Dead Bugs"
  | "Side Plank Dips"
  | "Russian Twists"
  | "Burpees"
  | "Squat Jumps"
  | "Box Jumps"
  | "Butt Kicks"
  | "Arm Circles"
  | "Toe Touches"
  | "Superman";

export const EXERCISES: {
  type: ExerciseType;
  description: string;
  muscles: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  targetReps: number;
}[] = [
  {
    type: "Squats",
    description:
      "Lower body compound movement tracking hip-knee-ankle angles for depth and form.",
    muscles: ["Quadriceps", "Glutes", "Hamstrings"],
    difficulty: "Beginner",
    targetReps: 15,
  },
  {
    type: "Pushups",
    description:
      "Upper body push exercise tracking elbow flexion and body alignment.",
    muscles: ["Chest", "Triceps", "Shoulders"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "Bicep Curls",
    description:
      "Isolation exercise tracking shoulder-elbow-wrist angle for controlled curling.",
    muscles: ["Biceps", "Forearms"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "Shoulder Press",
    description:
      "Overhead pressing movement tracking elbow extension and shoulder elevation.",
    muscles: ["Deltoids", "Triceps", "Upper Traps"],
    difficulty: "Intermediate",
    targetReps: 10,
  },
  {
    type: "Lunges",
    description:
      "Unilateral leg exercise tracking front knee angle for proper depth and alignment.",
    muscles: ["Quadriceps", "Glutes", "Hamstrings"],
    difficulty: "Intermediate",
    targetReps: 10,
  },
  {
    type: "Jumping Jacks",
    description:
      "Full body cardio tracking arm abduction and leg spread for rep counting.",
    muscles: ["Full Body", "Shoulders", "Calves"],
    difficulty: "Beginner",
    targetReps: 20,
  },
  {
    type: "Deadlifts",
    description:
      "Hip hinge movement tracking torso-to-thigh angle for safe lifting posture.",
    muscles: ["Hamstrings", "Glutes", "Lower Back"],
    difficulty: "Advanced",
    targetReps: 10,
  },
  {
    type: "Lateral Raises",
    description:
      "Shoulder isolation tracking arm abduction angle for controlled side raises.",
    muscles: ["Deltoids", "Upper Traps"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "High Knees",
    description:
      "Cardio exercise tracking alternating knee elevation relative to hip level.",
    muscles: ["Hip Flexors", "Core", "Calves"],
    difficulty: "Beginner",
    targetReps: 20,
  },
  {
    type: "Tricep Dips",
    description:
      "Upper body exercise tracking elbow flexion and extension for tricep isolation.",
    muscles: ["Triceps", "Chest", "Shoulders"],
    difficulty: "Intermediate",
    targetReps: 10,
  },
  {
    type: "Glute Bridges",
    description:
      "Hip extension movement tracking shoulder-hip-knee alignment for glute activation.",
    muscles: ["Glutes", "Hamstrings", "Core"],
    difficulty: "Beginner",
    targetReps: 15,
  },
  {
    type: "Crunches",
    description:
      "Core exercise tracking torso flexion angle for controlled abdominal contractions.",
    muscles: ["Abs", "Core", "Hip Flexors"],
    difficulty: "Beginner",
    targetReps: 15,
  },
  {
    type: "Wide Pushups",
    description:
      "Wider hand placement pushup tracking elbow angle for greater chest activation.",
    muscles: ["Chest", "Shoulders", "Triceps"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "Diamond Pushups",
    description:
      "Close-grip pushup tracking deep elbow flexion for tricep-focused pressing.",
    muscles: ["Triceps", "Chest", "Shoulders"],
    difficulty: "Intermediate",
    targetReps: 10,
  },
  {
    type: "Pike Pushups",
    description:
      "Inverted push position tracking shoulder-elbow angle for overhead pressing stimulus.",
    muscles: ["Shoulders", "Triceps", "Upper Chest"],
    difficulty: "Intermediate",
    targetReps: 8,
  },
  {
    type: "Wall Pushups",
    description:
      "Standing pushup against wall tracking elbow flexion for beginners and rehab.",
    muscles: ["Chest", "Shoulders", "Triceps"],
    difficulty: "Beginner",
    targetReps: 15,
  },
  {
    type: "Overhead Tricep Extension",
    description:
      "Arms-overhead elbow flexion and extension for long head tricep isolation.",
    muscles: ["Triceps"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "Tricep Kickbacks",
    description:
      "Bent-over elbow extension tracking forearm angle for tricep contraction.",
    muscles: ["Triceps"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "Hammer Curls",
    description:
      "Neutral-grip curl tracking elbow flexion for bicep and brachialis development.",
    muscles: ["Biceps", "Brachialis", "Forearms"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "Front Raises",
    description:
      "Forward arm elevation tracking shoulder flexion angle for anterior deltoid work.",
    muscles: ["Front Deltoids", "Upper Chest"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "Arnold Press",
    description:
      "Rotational overhead press tracking elbow extension with shoulder rotation.",
    muscles: ["Deltoids", "Triceps", "Upper Traps"],
    difficulty: "Intermediate",
    targetReps: 10,
  },
  {
    type: "Upright Rows",
    description:
      "Vertical pulling motion tracking elbow elevation for shoulder and trap activation.",
    muscles: ["Deltoids", "Traps", "Biceps"],
    difficulty: "Intermediate",
    targetReps: 10,
  },
  {
    type: "Bent Over Rows",
    description:
      "Hinged-torso pulling tracking elbow flexion for back and bicep development.",
    muscles: ["Lats", "Rhomboids", "Biceps"],
    difficulty: "Intermediate",
    targetReps: 10,
  },
  {
    type: "Reverse Flys",
    description:
      "Bent-over arm abduction tracking rear deltoid activation and scapular retraction.",
    muscles: ["Rear Deltoids", "Rhomboids", "Traps"],
    difficulty: "Intermediate",
    targetReps: 12,
  },
  {
    type: "Chest Flys",
    description:
      "Arm adduction tracking elbow-to-elbow distance for chest isolation.",
    muscles: ["Chest", "Front Deltoids"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "Sumo Squats",
    description:
      "Wide-stance squat tracking hip-knee-ankle angle for inner thigh emphasis.",
    muscles: ["Adductors", "Quadriceps", "Glutes"],
    difficulty: "Beginner",
    targetReps: 15,
  },
  {
    type: "Bulgarian Split Squats",
    description:
      "Rear-foot-elevated split squat tracking front knee angle for unilateral leg work.",
    muscles: ["Quadriceps", "Glutes", "Hamstrings"],
    difficulty: "Advanced",
    targetReps: 8,
  },
  {
    type: "Side Lunges",
    description:
      "Lateral lunge tracking knee flexion angle for adductor and quad engagement.",
    muscles: ["Adductors", "Quadriceps", "Glutes"],
    difficulty: "Intermediate",
    targetReps: 10,
  },
  {
    type: "Step Ups",
    description:
      "Single-leg step movement tracking knee extension for functional leg strength.",
    muscles: ["Quadriceps", "Glutes", "Calves"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "Calf Raises",
    description:
      "Ankle plantar flexion tracking heel elevation for calf development.",
    muscles: ["Calves", "Soleus"],
    difficulty: "Beginner",
    targetReps: 20,
  },
  {
    type: "Donkey Kicks",
    description:
      "Hip extension on all fours tracking knee-to-hip angle for glute isolation.",
    muscles: ["Glutes", "Hamstrings"],
    difficulty: "Beginner",
    targetReps: 15,
  },
  {
    type: "Fire Hydrants",
    description:
      "Hip abduction on all fours tracking lateral knee elevation for glute medius work.",
    muscles: ["Glute Medius", "Hip Abductors"],
    difficulty: "Beginner",
    targetReps: 15,
  },
  {
    type: "Hip Thrusts",
    description:
      "Shoulder-supported hip extension tracking hip angle for posterior chain activation.",
    muscles: ["Glutes", "Hamstrings", "Core"],
    difficulty: "Intermediate",
    targetReps: 12,
  },
  {
    type: "Good Mornings",
    description:
      "Forward hip hinge tracking torso angle for hamstring and lower back strengthening.",
    muscles: ["Hamstrings", "Lower Back", "Glutes"],
    difficulty: "Intermediate",
    targetReps: 10,
  },
  {
    type: "Wall Sit",
    description:
      "Isometric hold tracking knee angle at 90 degrees for quad endurance.",
    muscles: ["Quadriceps", "Glutes", "Core"],
    difficulty: "Beginner",
    targetReps: 10,
  },
  {
    type: "Sit Ups",
    description:
      "Full torso flexion tracking shoulder-to-knee distance for abdominal work.",
    muscles: ["Abs", "Hip Flexors", "Core"],
    difficulty: "Beginner",
    targetReps: 15,
  },
  {
    type: "Leg Raises",
    description:
      "Supine leg elevation tracking hip flexion angle for lower ab engagement.",
    muscles: ["Lower Abs", "Hip Flexors", "Core"],
    difficulty: "Intermediate",
    targetReps: 12,
  },
  {
    type: "Mountain Climbers",
    description:
      "Dynamic plank with alternating knee drives tracking hip-knee angles.",
    muscles: ["Core", "Hip Flexors", "Shoulders"],
    difficulty: "Intermediate",
    targetReps: 20,
  },
  {
    type: "Bicycle Crunches",
    description:
      "Alternating elbow-to-knee crunch tracking torso rotation and knee flexion.",
    muscles: ["Obliques", "Abs", "Hip Flexors"],
    difficulty: "Intermediate",
    targetReps: 20,
  },
  {
    type: "Flutter Kicks",
    description:
      "Alternating small leg raises tracking ankle elevation for lower ab work.",
    muscles: ["Lower Abs", "Hip Flexors", "Quads"],
    difficulty: "Beginner",
    targetReps: 20,
  },
  {
    type: "V-Ups",
    description:
      "Simultaneous torso and leg raise tracking body fold angle for advanced core.",
    muscles: ["Abs", "Hip Flexors", "Core"],
    difficulty: "Advanced",
    targetReps: 10,
  },
  {
    type: "Dead Bugs",
    description:
      "Supine alternating arm-leg extension tracking limb angles for core stability.",
    muscles: ["Core", "Abs", "Hip Flexors"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "Side Plank Dips",
    description:
      "Lateral hip dip tracking hip elevation angle for oblique strengthening.",
    muscles: ["Obliques", "Core", "Shoulders"],
    difficulty: "Intermediate",
    targetReps: 10,
  },
  {
    type: "Russian Twists",
    description:
      "Seated torso rotation tracking shoulder alignment for oblique activation.",
    muscles: ["Obliques", "Abs", "Core"],
    difficulty: "Intermediate",
    targetReps: 20,
  },
  {
    type: "Burpees",
    description:
      "Full body explosive movement tracking squat-to-stand transitions.",
    muscles: ["Full Body", "Chest", "Legs"],
    difficulty: "Advanced",
    targetReps: 10,
  },
  {
    type: "Squat Jumps",
    description:
      "Explosive squat with jump tracking hip-knee-ankle angle through power phase.",
    muscles: ["Quadriceps", "Glutes", "Calves"],
    difficulty: "Intermediate",
    targetReps: 12,
  },
  {
    type: "Box Jumps",
    description:
      "Plyometric jump tracking knee angle through explosive extension phase.",
    muscles: ["Quadriceps", "Glutes", "Calves"],
    difficulty: "Advanced",
    targetReps: 10,
  },
  {
    type: "Butt Kicks",
    description:
      "Running in place kicking heels to glutes tracking knee flexion for cardio.",
    muscles: ["Hamstrings", "Calves", "Hip Flexors"],
    difficulty: "Beginner",
    targetReps: 20,
  },
  {
    type: "Arm Circles",
    description:
      "Shoulder mobility exercise tracking arm rotation angle for warm-up.",
    muscles: ["Shoulders", "Rotator Cuff"],
    difficulty: "Beginner",
    targetReps: 20,
  },
  {
    type: "Toe Touches",
    description:
      "Standing forward bend tracking torso-to-thigh angle for flexibility and hamstrings.",
    muscles: ["Hamstrings", "Lower Back", "Core"],
    difficulty: "Beginner",
    targetReps: 12,
  },
  {
    type: "Superman",
    description:
      "Prone back extension tracking shoulder and hip elevation for posterior chain.",
    muscles: ["Lower Back", "Glutes", "Shoulders"],
    difficulty: "Beginner",
    targetReps: 12,
  },
];
