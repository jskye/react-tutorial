
// hardcoded dummy json data
var data = [
  {id: 1, author: "Pete Cunt", text: "This is one comment"},
  {id: 2, author: "Jordan Walke", text: "This is *another* comment"}
];



// the commentList component using property data passed down from parent CommentBox
var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});


// the commentList component using raw data.
// var CommentList = React.createClass({
//   render: function() {
//     return (
//       <div className="commentList">
// 		  <Comment author="Pete Hunt">This is one comment</Comment>
// 		  <Comment author="Jordan Walke">This is *another* comment</Comment>
// 	  </div>
//     );
//   }
// });


// note: With the traditional DOM, input elements are rendered and the browser
// manages the state (its rendered value). As a result, the state of the actual DOM
// will differ from that of the component which is not what we want.
// In React, components should always represent the state of the view
// and not only at the point of initialization.
// Hence, we use this.state to save the user's input as it is entered.
// We define an initial state with two properties author and text and set them to be empty strings.
// In our <input> elements, we set the value prop to reflect the state of the component
//  and attach onChange handlers to them.
// These <input> elements with a value set are called controlled components.
// Read more about controlled components here:
// https://facebook.github.io/react/docs/forms.html#controlled-components

var CommentForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  // clears the form fields when the form is submitted with valid input.
  handleSubmit: function(e) {
   e.preventDefault();
   var author = this.state.author.trim();
   var text = this.state.text.trim();
   if (!text || !author) {
	 return;
   }
   this.props.onCommentSubmit({author: author, text: text});
   this.setState({author: '', text: ''});
 },
  render: function() {
    return (
		<form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={this.state.author}
          onChange={this.handleAuthorChange}
        />
        <input
          type="text"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

// // the comment form component with http post
// var CommentForm = React.createClass({
//   render: function() {
//     return (
//       <form className="commentForm">
//         <input type="text" placeholder="Your name" />
//         <input type="text" placeholder="Say something..." />
//         <input type="submit" value="Post" />
//       </form>
//     );
//   }
// });

// the comment form component dummy
// var CommentForm = React.createClass({
//   render: function() {
//     return (
//       <div className="commentForm">
//         Hello, world! I am a CommentForm.
//       </div>
//     );
//   }
// });

// load the list and form components.
// tutorial1.js
// var CommentBox = React.createClass({
//   render: function() {
//     return (
//       <div className="commentBox">
// 		  <h1>Comments</h1>
// 		  <CommentList />
// 		  <CommentForm />
// 	  </div>
//     );
//   }
// });

// load the list and form components with property data that was loaded in on render.
var CommentBox = React.createClass({
	// sofar comments have been mutable, now we give them state, loaded into an array
	getInitialState: function() {
	  		return {data: []};
	},
	// send asynch ajax request for the fresh state of the comment data
	// replaces old initial state with new state from server
	loadCommentsFromServer: function() {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        cache: false,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },
	// poll the server for new data.
	componentDidMount: function() {
      this.loadCommentsFromServer();
      setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
	// handle comments that are submitted via the form component
	// When a user submits a comment, we will need to refresh the list of comments
	// to include the new one. It makes sense to do all of this logic in CommentBox
	// since CommentBox owns the state that represents the list of comments.
	// We need to pass data from the child component back up to its parent.
	// We do this by passing a callback (handleCommentSubmit) from the parent's
	// render method, into the child, which binds it to the child's onCommentSubmit event.
	// CommentBox has made the callback available to CommentForm via the onCommentSubmit prop,
	// the CommentForm can call the callback when the user submits the form.
	// Whenever the event is triggered, the callback will be invoked.

	// the submit callback function
	handleCommentSubmit: function(comment) {
	// instead of waiting for the request to complete before the submitted
	// comment appears in the list. We can optimistically add this comment to
	// the list before sending to the server to make the app feel faster.

	// the current state of the comments
	var comments = this.state.data;
    // Optimistically set an id on the new comment. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});

   // submit to the server and refresh the list
	   $.ajax({
			  url: this.props.url,
			  dataType: 'json',
			  type: 'POST',
			  data: comment,
			  success: function(data) {
				this.setState({data: data});
			  }.bind(this),
			  error: function(xhr, status, err) {
				this.setState({data: comments});
				console.error(this.props.url, status, err.toString());
			  }.bind(this)
		});
 	},
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
		<CommentList data={this.state.data} />
		{/*callback is passed to form component on the onCommentSubmit event */}
		<CommentForm onCommentSubmit={this.handleCommentSubmit} />
        {/*<CommentList data={this.props.data} />*/}
        {/*<CommentForm />*/}
      </div>
    );
  }
});

// define the comment component (without remarkable markups)
// var Comment = React.createClass({
//   render: function() {
//     return (
//       <div className="comment">
//         <h2 className="commentAuthor">
//           {this.props.author}
//         </h2>
//         {this.props.children}
//       </div>
//     );
//   }
// });

// define the comment (with remarkable markups), but tags will show due to React.
// var Comment = React.createClass({
//   render: function() {
//     var md = new Remarkable();
//     return (
//       <div className="comment">
//         <h2 className="commentAuthor">
//           {this.props.author}
//         </h2>
//         {md.render(this.props.children.toString())}
//       </div>
//     );
//   }
// });

// for the Remarkeable markup to work,
// we need to tell it to ignore Reacts default XSS guarding.
// were relying on remarkable to be secure.
// it is, remarkable automatically strips HTML markup and insecure links from the output.
// tutorial7.js
var Comment = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});



// instead of using jsx tags we could also use raw js, but its more work
// var CommentBox = React.createClass({displayName: 'CommentBox',
//   render: function() {
//     return (
//       React.createElement('div', {className: "commentBox"},
//         "Hello, world! I am a CommentBox."
//       )
//     );
//   }
// });

// The render method always needs to be loaded last. it renders the main DOM node.
// here we create a CommentBox and render it as Reacts root node.
ReactDOM.render(
	// passing in hardcoded json data as a property
	// <CommentBox data={data} />,
	// passing in server endpoint and polling interval as properties
	<CommentBox url="/api/comments" pollInterval={2000} />,
	// <CommentBox url="/api/comments" />,
	// React.createElement(CommentBox, null),
	document.getElementById('content')
);
