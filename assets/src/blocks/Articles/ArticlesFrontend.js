import { Component, Fragment } from '@wordpress/element';
import { ArticlePreview } from './ArticlePreview';

const { apiFetch } = wp;
const { addQueryArgs } = wp.url;

export class ArticlesFrontend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      total_pages: 0
    };
  }

  componentDidMount() {
    this.loadArticles();
  }

  componentDidUpdate(prevProps) {
    const { article_count, tags, posts, post_types, ignore_categories } = this.props;
    if (
      article_count !== prevProps.article_count ||
      tags.length !== prevProps.tags.length ||
      posts.length !== prevProps.posts.length ||
      post_types.length !== prevProps.post_types.length ||
      ignore_categories !== prevProps.ignore_categories
    ) {
      this.loadArticles();
    }
  }

  loadArticles() {
    const { article_count, posts, tags, post_types, ignore_categories, postType, postId } = this.props;

    const args = {
      article_count,
      post_types,
      posts,
      tags,
      ignore_categories
    };

    if (postType === 'post') args.exclude_post_id = postId;

    const queryArgs = {
      path: addQueryArgs('/planet4/v1/get-articles', args)
    };
    apiFetch(queryArgs).then(result => {
      this.setState({ posts: result.posts, total_pages: result.pages })
    });
  }

  render() {
    const {
      article_heading,
      articles_description,
      read_more_text,
      read_more_link,
      button_link_new_tab,
      article_count,
      isEditing,
      postType
    } = this.props;

    const { posts, total_pages } = this.state;

    return (
      <Fragment>
        <section className="block articles-block">
          <div className="container">
            {article_heading && !isEditing &&
              <header>
                <h2 className="page-section-header">{article_heading}</h2>
              </header>
            }
            {articles_description && !isEditing &&
              <div className="page-section-description">{articles_description}</div>
            }
            <div className="article-list-section clearfix">
              {posts && posts.length > 0 && posts.map(post =>
                <ArticlePreview key={post.post_title} isCampaign={postType === 'campaign'} post={post} />
              )}
            </div>
            {total_pages > 1 && !isEditing &&
              <div className="row">
                {read_more_link ?
                  <div className="col-md-12 col-lg-5 col-xl-5 mr-auto">
                    <a
                      className="btn btn-secondary btn-block article-load-more"
                      href={read_more_link}
                      target={button_link_new_tab ? '_blank' : ''}
                    >
                      {read_more_text}
                    </a>
                  </div> :
                  <div className="col-md-12 col-lg-5 col-xl-5">
                    <button
                      className="btn btn-secondary btn-block article-load-more load-more"
                      data-content=".article-list-section"
                      data-page="1"
                      data-total_pages={total_pages}
                      data-article_count={article_count}
                    // TODO:   {% for key,value in dataset %}
                    //       data-{{ value }}
                    // {% endfor %}
                    >
                      {read_more_text}
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </section>
      </Fragment >
    )
  }
}
