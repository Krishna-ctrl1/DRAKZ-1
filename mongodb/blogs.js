import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables from parent directory
config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

async function insertBlogs() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    const collection = db.collection('blogs');
    
    const blogsData = [
      {
        title: '10 Smart Investment Strategies for Young Professionals',
        content: 'Investing early is one of the most powerful ways to build wealth. Here are 10 proven strategies that young professionals can use to start their investment journey...',
        author_type: 'advisor',
        author_id: 1, // Should match advisors._id
        status: 'approved',
        verified_by: 1, // Should match admins._id
        published_at: new Date('2024-06-15T10:30:00Z'),
        created_at: new Date('2024-06-10T14:20:00Z')
      },
      {
        title: 'My Journey from Debt to Financial Freedom',
        content: 'Two years ago, I was drowning in credit card debt and personal loans. Today, I am debt-free and have started building my investment portfolio. Here is how I did it...',
        author_type: 'user',
        author_id: 2, // Should match users._id
        status: 'approved',
        verified_by: 2, // Should match admins._id
        published_at: new Date('2024-07-20T16:45:00Z'),
        created_at: new Date('2024-07-18T09:15:00Z')
      },
      {
        title: 'Understanding Mutual Fund SIPs: A Comprehensive Guide',
        content: 'Systematic Investment Plans (SIPs) are one of the most popular investment vehicles in India. This guide will help you understand how SIPs work and how to choose the right funds...',
        author_type: 'advisor',
        author_id: 2,
        status: 'approved',
        verified_by: 1,
        published_at: new Date('2024-08-05T11:00:00Z'),
        created_at: new Date('2024-08-01T13:30:00Z')
      },
      {
        title: 'Tax-Saving Investments: ELSS vs PPF vs NPS',
        content: 'With the financial year ending, many investors are looking for tax-saving options. Let me compare the three most popular tax-saving investments: ELSS, PPF, and NPS...',
        author_type: 'user',
        author_id: 3,
        status: 'pending',
        verified_by: null,
        published_at: null,
        created_at: new Date('2024-08-20T12:00:00Z')
      },
      {
        title: 'Real Estate Investment: Is Now the Right Time?',
        content: 'The real estate market has seen significant changes post-pandemic. As a financial advisor, I often get asked whether it is the right time to invest in real estate...',
        author_type: 'advisor',
        author_id: 1,
        status: 'approved',
        verified_by: 2,
        published_at: new Date('2024-08-18T14:20:00Z'),
        created_at: new Date('2024-08-15T10:45:00Z')
      },
      {
        title: 'How I Built My Emergency Fund in 12 Months',
        content: 'Building an emergency fund seemed impossible with my salary, but I managed to save 6 months of expenses in just 12 months. Here are the strategies that worked for me...',
        author_type: 'user',
        author_id: 4,
        status: 'rejected',
        verified_by: 1,
        published_at: null,
        created_at: new Date('2024-08-22T15:30:00Z')
      },
      {
        title: 'Cryptocurrency Investments: Risks and Opportunities',
        content: 'Cryptocurrency has gained massive popularity among young investors. While the potential returns are attractive, it is important to understand the risks involved...',
        author_type: 'advisor',
        author_id: 2,
        status: 'pending',
        verified_by: null,
        published_at: null,
        created_at: new Date('2024-08-25T09:15:00Z')
      },
      {
        title: 'Insurance Planning: Term vs Whole Life Insurance',
        content: 'Choosing the right life insurance can be confusing. As someone who recently went through this process, I want to share my research and decision-making process...',
        author_type: 'user',
        author_id: 5,
        status: 'approved',
        verified_by: 2,
        published_at: new Date('2024-08-12T13:00:00Z'),
        created_at: new Date('2024-08-08T11:20:00Z')
      }
    ];
    
    const result = await collection.insertMany(blogsData);
    console.log(`${result.insertedCount} blogs inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting blogs:', error);
  } finally {
    await client.close();
  }
}

insertBlogs();