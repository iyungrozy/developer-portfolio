const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create dummy Images
  const image1 = await prisma.image.create({
    data: {
      url: "https://firebasestorage.googleapis.com/v0/b/YOUR_FIREBASE_PROJECT_ID/o/image1.jpg?alt=media",
    },
  });

  const image2 = await prisma.image.create({
    data: {
      url: "https://firebasestorage.googleapis.com/v0/b/YOUR_FIREBASE_PROJECT_ID/o/image2.jpg?alt=media",
    },
  });

  // Create dummy Users
  const user1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      image: image1.url,
      role: "USER",
      providers: ["google", "facebook"],
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      image: image2.url,
      role: "ADMIN",
      providers: ["google"],
    },
  });

  // Create dummy Tags
  const tag1 = await prisma.tag.create({
    data: {
      name: "Web Development",
    },
  });

  const tag2 = await prisma.tag.create({
    data: {
      name: "Design",
    },
  });

  // Create dummy Projects
  await prisma.project.createMany({
    data: [
      {
        title: "Project One",
        demo_link: "https://example.com/demo1",
        source_link: "https://github.com/example/source1",
        published: true,
        tagIds: [tag1.id],
        imageId: image1.id,
      },
      {
        title: "Project Two",
        demo_link: "https://example.com/demo2",
        source_link: "https://github.com/example/source2",
        published: true,
        tagIds: [tag2.id],
        imageId: image2.id,
      },
    ],
  });

  // Create dummy Feedback
  await prisma.feedback.createMany({
    data: [
      {
        feedback: "Great project!",
        bio: "Software Engineer",
        rating: 5,
        name: "John Doe",
        imageId: image1.id,
        published: true,
        userId: user1.id,
      },
      {
        feedback: "Needs improvement.",
        bio: "UX Designer",
        rating: 3,
        name: "Jane Smith",
        imageId: image2.id,
        published: true,
        userId: user2.id,
      },
    ],
  });

  // Create dummy Certificates
  await prisma.certificate.createMany({
    data: [
      {
        url: "https://example.com/certificate1",
        imageId: image1.id,
        published: true,
      },
      {
        url: "https://example.com/certificate2",
        imageId: image2.id,
        published: true,
      },
    ],
  });

  // Create dummy Technology Levels
  const level1 = await prisma.technologyLevel.create({
    data: {
      name: "Beginner",
    },
  });

  const level2 = await prisma.technologyLevel.create({
    data: {
      name: "Intermediate",
    },
  });

  // Create dummy Technologies
  await prisma.technology.createMany({
    data: [
      {
        name: "JavaScript",
        imageId: image1.id,
        levelId: level1.id,
        categoryIds: [], // Add category IDs as needed
      },
      {
        name: "TypeScript",
        imageId: image2.id,
        levelId: level2.id,
        categoryIds: [], // Add category IDs as needed
      },
    ],
  });

  console.log('Dummy data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
