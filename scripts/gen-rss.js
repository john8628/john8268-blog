
const { promises: fs } = require('fs')
const path = require('path')
const RSS = require('rss')
const matter = require('gray-matter')

async function generate() {
  const feed = new RSS({
    title: 'john8268',
    site_url: 'http://localhost:3000/',
    feed_url: 'http://localhost:3000/feed.xml',
  })
  const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const postsDirectory = path.join(__dirname, '..', 'pages', 'posts');

const posts = await fs.readdir(postsDirectory);

await Promise.all(
  posts.map(async (name) => {
    const filePath = path.join(postsDirectory, name);
    const stats = await fs.stat(filePath);

    if (!stats.isFile() || !name.endsWith('.md')) {
      return; // 如果不是文件或不是 .md 文件，跳过处理
    }

    const content = await fs.readFile(filePath);
    const frontmatter = matter(content);

    feed.item({
      title: frontmatter.data.title,
      url: '/posts/' + name.replace(/\.mdx?/, ''),
      date: frontmatter.data.date,
      description: frontmatter.data.description,
      categories: frontmatter.data.tag.split(', '),
      author: frontmatter.data.author,
    });
  })
);

  // const posts = await fs.readdir(path.join(__dirname, '..', 'pages', 'posts'))

  // await Promise.all(
  //   posts.map(async (name) => {
  //     if (name.startsWith('index.') && name.startsWith("t") && !name.endsWith('.md')) return
  //     const content = await fs.readFile(
  //       path.join(__dirname, '..', 'pages', 'posts', name)
  //     )
  //     const frontmatter = matter(content)

  //     feed.item({
  //       title: frontmatter.data.title,
  //       url: '/posts/' + name.replace(/\.mdx?/, ''),
  //       date: frontmatter.data.date,
  //       description: frontmatter.data.description,
  //       categories: frontmatter.data.tag.split(', '),
  //       author: frontmatter.data.author,
  //     })
  //   })
  // )

  await fs.writeFile('./public/feed.xml', feed.xml({ indent: true }))
}

generate()
