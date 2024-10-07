# project overview
- use this guide to build a web app where users can give a text prompt to generate an emoji using model hosted on Replicate.

# feature requirements
- We will use Next.js, Shadcn, Lucid, Supabase and Clerk
- Create a form where users can put in prompt and clicking on button that calls the replicate model to generate emoji.
- have a nice ui & animation when emoji is blank or generating.
- display all the images ever generated in grid
- when hover over each emoj img, an icon button for download should appear and an icon button for like should be shown.

# relevant docs
## how to use replicate image generation model

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
const output = await replicate.run(
  "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
  {
    input: {
      width: 1024,
      height: 1024,
      prompt: "A TOK emoji of a man",
      refine: "no_refiner",
      scheduler: "K_EULER",
      lora_scale: 0.6,
      num_outputs: 1,
      guidance_scale: 7.5,
      apply_watermark: false,
      high_noise_frac: 0.8,
      negative_prompt: "",
      prompt_strength: 0.8,
      num_inference_steps: 50
    }
  }
);
console.log(output);

# current file structure
EMOJIAPP
└── my-app
    ├── app
    │   ├── fonts
    │   │   ├── GeistMonoVF.woff
    │   │   └── GeistVF.woff
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components
    │   └── ui
    │       ├── button.tsx
    │       ├── card.tsx
    │       └── input.tsx
    ├── lib
    │   └── utils.ts
    ├── node_modules
    ├── requirements
    │   └── frontend_instructions.md
    ├── .env.local
    ├── .eslintrc.json
    ├── .gitignore
    ├── components.json
    ├── next-env.d.ts
    ├── next.config.mjs
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── README.md
    ├── tailwind.config.ts
    └── tsconfig.json

#rules
- all new components should go in EMOJIAPP/my-app/components/ui and be named like example-component.tsx unless otherwise specified as in the above file structure
- all new pages go in EMOJIAPP/my-app/app as in the above file structure
-make sure you dont create any files outside EMOJIAPP/my-app folder.
-all lib files should go in EMOJIAPP/my-app/lib

