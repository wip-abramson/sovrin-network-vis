import React from 'react';
import * as d3 from 'd3';
import graphData from './graphdata'

const NetworkVisualisation = () => {
    let [displayAuthorship, setDisplayAuthorship] = React.useState(false)

    const createNodesAndLinks = React.useCallback(() => {
        let data = graphData

        console.log("CREATE NODES")
        console.log("Display Authorship", displayAuthorship)
        let nodes = []
        let links = []

        data.forEach(txn => {
            // console.log(txn)

            let node = {
                id: txn.txnMetadata.seqNo,
                txnId: txn.txnMetadata.txnId,
                from: txn.txn.metadata.from,
                endorser: txn.txn.metadata.endorser ? txn.txn.metadata.endorser : txn.txn.metadata.from,
                type: txn.txn.type
            }
            if (txn.txn.type == "1") {
                node.did = txn.txn.data.dest
                node.isEndorser = txn.txn.data.role == "101"
                console.log("NODE DID", node.did)
            } else {
                node.did = null
            }

            if (txn.txn.type == "102") {
                links.push({
                    source: node.id,
                    target: txn.txn.data.ref,
                    isSchemaId: true
                })

            }


            nodes.push(node)

        })

        nodes.forEach(node => {
            if (displayAuthorship) {
                let from = node.from

                let fromNode = nodes.find(element => element.did == from)


                if (fromNode) {
                    links.push({
                        source: fromNode.id,
                        target: node.id,
                        type: "TX AUTHOR"
                    })
                }
            } else {
                let endorser = node.endorser

                let endorserTx = nodes.find(tx => tx.did == endorser)
                if (endorserTx) {

                    links.push({
                        source: endorserTx.id,
                        target: node.id,
                        type: "TX ENDORSEMENT"
                    })

                }
            }





        })

        console.log(links)
        let newGraph = {
            nodes: nodes,
            links: links
        }
        drawChart(newGraph)
    }, [])



    const drawChart = React.useCallback((graph) => {
        const height = window.innerHeight - 70;
        const width = window.innerWidth - 100;
        console.log(graph)

        // Define the div for the tooltip
        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.select("svg").remove();

        const svg = d3
            .select('#d3-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        let link = svg
            .selectAll(".link")
            .data(graph.links)
            .join("line")
            .classed("link", true)
            .classed("schema-id", d => d.isSchemaId)
        let node = svg
            .selectAll(".node")
            .data(graph.nodes)
            .join("circle")
            .attr("r", 12)
            .classed("node", true)
            .classed("definition", d => {

                // console.log("TYPE", d.type)
                return d.type == 102

            })
            .classed("nym", d => d.type == 1)
            .classed("endorser", d => {
                console.log(d.role)
                return d.isEndorser
            })
            .classed("schema", d =>d.type == 101)
            .on("mouseover", function(event, d) {
                let type = null;
                let identifier = null
                switch (d.type) {
                    case "101":
                        type = "SCHEMA"
                        identifier = d.txnId
                        break;
                    case "102":
                        type = "CLAIM_DEF"
                        identifier = d.txnId

                        break;
                    case "1":
                        type = "NYM"
                        identifier = d.did

                        break
                    default:
                        break;
                }

                let html = "Tx SeqNo: "  +d.id + "<br/> Type: " + type + "<br/> "
                if (d.type === "1") {
                    html += "DID: " + identifier + "<br/>"
                    html += d.isEndorser ? "Role: Tx Endorser" : "Role: Tx Author"
                } else {
                    html += "ID : " + identifier
                }

                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(html)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(1000)
                    .style("opacity", 0);
            });

        // yield svg.node();

        const simulation = d3
            .forceSimulation()
            .nodes(graph.nodes)
            .force("charge", d3.forceManyBody().distanceMax(height/2).strength(-250))
            .force("center", d3.forceCenter(width / 2, height / 2).strength(1))
            .force("link", d3.forceLink(graph.links).distance(40).id(function(d) {
                // console.log(d)
                return d.id;
              }))
            .on("tick", tick);

        const drag = d3
            .drag()
            .on("start", dragstart)
            .on("drag", dragged);

        node.call(drag).on("click", click);

        function tick() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }

        function click(event, d) {
            delete d.fx;
            delete d.fy;
            d3.select(this).classed("fixed", false);
            simulation.alpha(1).restart();
        }

        function dragstart() {
            d3.select(this).classed("fixed", true);
        }

        function dragged(event, d) {
            d.fx = clamp(event.x, 0, width);
            d.fy = clamp(event.y, 0, height);
            simulation.alpha(1).restart();

        }
    }, [])

    function clamp(x, lo, hi) {
        return x < lo ? lo : x > hi ? hi : x;
    }

    React.useEffect(() => {
        console.log('Mounted');
        createNodesAndLinks();
    }, [displayAuthorship, createNodesAndLinks, drawChart]);

    return (<div className="visualisation">
        <div className="toggle-bar">
            <button className={displayAuthorship && "selected"} onClick={() => {
                setDisplayAuthorship(true)}}>Graph Tx Authorship</button>
            <button className={!displayAuthorship && "selected"} onClick={() => setDisplayAuthorship(false)}>Graph Tx Endorsement</button></div>
        <div id="d3-container">


        </div>
    </div>)

}

export default NetworkVisualisation
