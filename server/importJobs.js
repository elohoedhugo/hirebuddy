const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()
const filePath = path.join(__dirname, 'data', 'all_jobs_2025-05-22.jsonl')

async function importJobs() {
  try{
      const fileContent = fs.readFileSync(filePath, 'utf8')
      
      const jobs = fileContent
      .split('\n')
      .filter(line=>line.trim())
      .map(JSON.parse)

      for(const job of jobs) {

        await prisma.job.create({
          data: {
            title: job.job_title || "No title provided",
            company: job.company_name || "Unknown company",
            location: job.job_location || "Loaction not specified",
            applyLink: job.apply_link || "No link provided",
            description: job.job_description || "No description available",
            source: job.source || "Unknown source",
          }
        })
      }
        console.log(`Imported ${jobs.length} jobs`)
    } catch(error) {
      console.error(`Import failed: ${error}`)
    }
      finally{
        await prisma.$disconnect()
      }
}

importJobs()