export class Path {
  constructor() {
    this.destination = null;
    this.waypoints = [];
  }

  follow(waypoints) {
    this.destination = waypoints[waypoints.length - 1];
    this.waypoints = waypoints;
  }

  get nextWaypoint() {
    return this.waypoints[0];
  }

  get destinationReached() {
    return this.waypoints.length === 0;
  }
};
